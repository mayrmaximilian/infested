import { redirect } from "next/navigation";
import { CheckCircle2, UserPlus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { SocialSearch } from "@/components/social/social-search";
import { SocialTabs } from "@/components/social/social-tabs";
import { SocialActivity } from "@/components/social/social-activity";
import { SocialFriends } from "@/components/social/social-friends";
import { ChatPanel } from "@/components/messages/chat-panel";
import {
  acceptFriendRequestAction,
  cancelFriendRequestAction,
  sendFriendRequestAction,
} from "@/app/actions/social";

export const dynamic = "force-dynamic";

type FriendProfile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string | null;
};

type Friendship = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted" | "blocked";
};

type Room = {
  id: string;
  name: string | null;
  is_group: boolean;
  created_by: string;
  direct_user_a: string | null;
  direct_user_b: string | null;
  created_at: string;
};

type ChatProfile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
};

type ChatMessage = {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

type ActivityGame = {
  id: string;
  title: string;
  cover_url: string | null;
  genre: string | null;
};

type ActivityItem = {
  id: string;
  type: "follow" | "launch";
  user_id: string;
  created_at: string;
  game: ActivityGame;
};

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function toTimestamp(value: string) {
  const date = new Date(value);
  const time = date.getTime();
  return Number.isNaN(time) ? 0 : time;
}

export default async function SocialPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; room?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const resolvedParams = searchParams ? await searchParams : {};
  const query = (resolvedParams.q ?? "").trim();
  const selectedRoomId = resolvedParams.room;

  const { data: friendships } = await supabase
    .from("friendships")
    .select("id, requester_id, addressee_id, status")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

  const relationshipMap = new Map<string, Friendship>();
  const friendIds = new Set<string>();

  (friendships ?? []).forEach((row) => {
    const otherId =
      row.requester_id === user.id ? row.addressee_id : row.requester_id;
    relationshipMap.set(otherId, row as Friendship);
    friendIds.add(otherId);
  });

  const { data: relatedProfiles } = friendIds.size
    ? await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, role")
        .in("id", Array.from(friendIds))
    : { data: [] };

  const profileMap = new Map(
    (relatedProfiles ?? []).map((profile) => [
      profile.id,
      profile as FriendProfile,
    ])
  );

  const pendingIncoming = (friendships ?? []).filter(
    (row) => row.status === "pending" && row.addressee_id === user.id
  );
  const pendingOutgoing = (friendships ?? []).filter(
    (row) => row.status === "pending" && row.requester_id === user.id
  );
  const accepted = (friendships ?? []).filter(
    (row) => row.status === "accepted"
  );

  const acceptedFriendIds = new Set<string>();
  accepted.forEach((row) => {
    const otherId =
      row.requester_id === user.id ? row.addressee_id : row.requester_id;
    acceptedFriendIds.add(otherId);
  });

  const acceptedProfiles = Array.from(acceptedFriendIds)
    .map((id) => profileMap.get(id))
    .filter(Boolean) as FriendProfile[];

  let searchResults: FriendProfile[] = [];
  if (query.length >= 2) {
    const { data: matches } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, role")
      .ilike("display_name", `%${query}%`)
      .limit(20);

    searchResults = (matches ?? []).filter((profile) => profile.id !== user.id);
  }

  const friendIdList = Array.from(acceptedFriendIds);

  const { data: followRows } = friendIdList.length
    ? await supabase
        .from("game_follows")
        .select(
          `
          id,
          user_id,
          created_at,
          games!inner (
            id,
            title,
            cover_url,
            genre
          )
        `
        )
        .in("user_id", friendIdList)
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] };

  const { data: newGames } = friendIdList.length
    ? await supabase
        .from("games")
        .select("id, title, cover_url, genre, created_at, owner_id")
        .in("owner_id", friendIdList)
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] };

  const followItems: ActivityItem[] = (followRows ?? []).flatMap((row) => {
    const game = (row.games as ActivityGame[] | null)?.[0] || null;
    if (!game) return [];
    return [
      {
        id: `follow-${row.id}`,
        type: "follow",
        user_id: row.user_id,
        created_at: row.created_at,
        game,
      },
    ];
  });

  const launchItems: ActivityItem[] = (newGames ?? []).map((game) => ({
    id: `launch-${game.id}`,
    type: "launch",
    user_id: game.owner_id,
    created_at: game.created_at,
    game: {
      id: game.id,
      title: game.title,
      cover_url: game.cover_url,
      genre: game.genre,
    },
  }));

  const activityItems = [...followItems, ...launchItems]
    .filter((item) => profileMap.has(item.user_id))
    .sort((a, b) => toTimestamp(b.created_at) - toTimestamp(a.created_at))
    .slice(0, 20);

  const activityEntries = activityItems.flatMap((item) => {
    const profile = profileMap.get(item.user_id);
    if (!profile) return [];
    return [
      {
        id: item.id,
        type: item.type,
        created_at: item.created_at,
        user: profile,
        game: item.game,
      },
    ];
  });

  const { data: membershipRows } = await supabase
    .from("chat_members")
    .select("room_id")
    .eq("user_id", user.id);

  const roomIds = membershipRows?.map((row) => row.room_id) ?? [];

  const { data: rooms } = roomIds.length
    ? await supabase
        .from("chat_rooms")
        .select(
          "id, name, is_group, created_by, direct_user_a, direct_user_b, created_at"
        )
        .in("id", roomIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  let roomsList = (rooms ?? []) as Room[];
  let selectedRoom =
    roomsList.find((room) => room.id === selectedRoomId) ?? null;

  if (!selectedRoom && selectedRoomId) {
    const { data: fallbackRoom } = await supabase
      .from("chat_rooms")
      .select(
        "id, name, is_group, created_by, direct_user_a, direct_user_b, created_at"
      )
      .eq("id", selectedRoomId)
      .maybeSingle();

    if (fallbackRoom) {
      selectedRoom = fallbackRoom as Room;
      if (!roomsList.some((room) => room.id === fallbackRoom.id)) {
        roomsList = [fallbackRoom as Room, ...roomsList];
      }
    }
  }

  const roomsForList = roomsList;

  const directIds = new Set<string>();
  roomsForList.forEach((room) => {
    if (!room.is_group && room.direct_user_a && room.direct_user_b) {
      const otherId =
        room.direct_user_a === user.id
          ? room.direct_user_b
          : room.direct_user_a;
      if (otherId) directIds.add(otherId);
    }
  });

  const { data: directProfiles } = directIds.size
    ? await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", Array.from(directIds))
    : { data: [] };

  const chatProfileMap = new Map(
    (directProfiles ?? []).map((profile) => [
      profile.id,
      profile as ChatProfile,
    ])
  );

  acceptedProfiles.forEach((profile) => {
    chatProfileMap.set(profile.id, {
      id: profile.id,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
    });
  });

  const roomSummaries = roomsForList.map((room) => {
    let label = room.name ?? "Group chat";
    let subtitle = room.is_group ? "Group" : "Direct";

    if (!room.is_group && room.direct_user_a && room.direct_user_b) {
      const otherId =
        room.direct_user_a === user.id
          ? room.direct_user_b
          : room.direct_user_a;
      const otherProfile = otherId ? chatProfileMap.get(otherId) : null;
      label = otherProfile?.display_name ?? "Direct chat";
      subtitle = "Direct";
    }

    return {
      id: room.id,
      label,
      subtitle,
      is_group: room.is_group,
    };
  });

  let initialMessages: ChatMessage[] = [];
  let participants: ChatProfile[] = [];
  let roomLabel = "";

  if (selectedRoom) {
    const { data: messages } = await supabase
      .from("chat_messages")
      .select("id, room_id, sender_id, content, created_at")
      .eq("room_id", selectedRoom.id)
      .order("created_at", { ascending: true })
      .limit(200);

    initialMessages = (messages ?? []) as ChatMessage[];

    const { data: memberRows } = await supabase
      .from("chat_members")
      .select("user_id")
      .eq("room_id", selectedRoom.id);

    const memberIds = memberRows?.map((row) => row.user_id) ?? [];
    const { data: memberProfiles } = memberIds.length
      ? await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .in("id", memberIds)
      : { data: [] };

    participants = (memberProfiles ?? []) as ChatProfile[];

    if (selectedRoom.is_group) {
      roomLabel = selectedRoom.name ?? "Group chat";
    } else {
      const otherId =
        selectedRoom.direct_user_a === user.id
          ? selectedRoom.direct_user_b
          : selectedRoom.direct_user_a;
      const otherProfile = otherId ? chatProfileMap.get(otherId) : null;
      roomLabel = otherProfile?.display_name ?? "Direct chat";
    }
  }

  const renderProfile = (profile?: FriendProfile) => {
    if (!profile) return null;

    const name = profile.display_name || "Player";
    return (
      <div className="flex items-center gap-3">
        <div className="relative h-11 w-11 overflow-hidden rounded-full border border-[#1f2128] bg-[#0a0b0f]">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-white/70">
              {initialsFor(name)}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{name}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            {profile.role ?? "gamer"}
          </p>
        </div>
      </div>
    );
  };

  const searchResultsSection = (
    <section
      id="results"
      className="rounded-2xl border border-[#1f2128] bg-[#0b0d12] scroll-mt-24"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <h2 className="text-sm font-semibold">Search results</h2>
        {pendingOutgoing.length > 0 ? (
          <span className="text-xs text-white/40">
            {pendingOutgoing.length} pending
          </span>
        ) : null}
      </div>
      <div className="px-5 py-4">
        {searchResults.length === 0 ? (
          <p className="text-sm text-white/50">No players found.</p>
        ) : (
          <div className="divide-y divide-white/10">
            {searchResults.map((profile) => {
              const relationship = relationshipMap.get(profile.id);
              const isOutgoing =
                relationship?.status === "pending" &&
                relationship.requester_id === user.id;
              const isIncoming =
                relationship?.status === "pending" &&
                relationship.addressee_id === user.id;
              const isFriend = relationship?.status === "accepted";

              return (
                <div
                  key={profile.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-4"
                >
                  {renderProfile(profile)}
                  <div className="flex items-center gap-2">
                    {isFriend ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="gap-2"
                        disabled
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Friends
                      </Button>
                    ) : isOutgoing ? (
                      <form action={cancelFriendRequestAction as any}>
                        <input
                          type="hidden"
                          name="targetId"
                          value={profile.id}
                        />
                        <Button size="sm" variant="ghost" className="gap-2">
                          <X className="h-4 w-4" />
                          Cancel request
                        </Button>
                      </form>
                    ) : isIncoming ? (
                      <form action={acceptFriendRequestAction as any}>
                        <input
                          type="hidden"
                          name="targetId"
                          value={profile.id}
                        />
                        <Button size="sm" className="gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Accept
                        </Button>
                      </form>
                    ) : (
                      <form action={sendFriendRequestAction as any}>
                        <input
                          type="hidden"
                          name="targetId"
                          value={profile.id}
                        />
                        <Button size="sm" className="gap-2">
                          <UserPlus className="h-4 w-4" />
                          Add friend
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );

  const activitySection = <SocialActivity initialItems={activityEntries} />;

  const discoverContent = (
    <div className="space-y-4">
      {query.length >= 2 ? searchResultsSection : null}
      {activitySection}
    </div>
  );

  const incomingEntries = pendingIncoming.flatMap((row) => {
    const profile = profileMap.get(row.requester_id);
    if (!profile) return [];
    return [{ id: row.id, user_id: row.requester_id, user: profile }];
  });

  const acceptedEntries = accepted.flatMap((row) => {
    const otherId =
      row.requester_id === user.id ? row.addressee_id : row.requester_id;
    const profile = profileMap.get(otherId);
    if (!profile) return [];
    return [{ id: row.id, user_id: otherId, user: profile }];
  });

  const friendsContent = (
    <SocialFriends
      initialIncoming={incomingEntries}
      initialAccepted={acceptedEntries}
    />
  );

  const chatContent = (
    <ChatPanel
      rooms={roomSummaries}
      currentUserId={user.id}
      initialRoomId={selectedRoom?.id ?? null}
      initialRoomLabel={roomLabel}
      initialMessages={initialMessages}
      initialParticipants={participants}
      friends={acceptedProfiles}
    />
  );

  const defaultTab = selectedRoomId ? "chat" : query ? "discover" : "friends";

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-white/50">
            social
          </p>
          <h1 className="text-3xl font-semibold">Friends & Crew</h1>
          <p className="text-white/60">
            Search players, send requests, and chat in real time.
          </p>
        </div>
        <div className="w-full max-w-xl">
          <SocialSearch initialQuery={query} variant="header" />
        </div>
      </header>

      <SocialTabs
        defaultTab={defaultTab}
        discover={discoverContent}
        friends={friendsContent}
        chat={chatContent}
      />
    </div>
  );
}

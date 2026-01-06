import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type ActivityProfile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string | null;
};

type ActivityGame = {
  id: string;
  title: string;
  cover_url: string | null;
  genre: string | null;
};

type ActivityEntry = {
  id: string;
  type: "follow" | "launch";
  created_at: string;
  user: ActivityProfile;
  game: ActivityGame;
};

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: friendships } = await supabase
    .from("friendships")
    .select("requester_id, addressee_id, status")
    .eq("status", "accepted")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

  const friendIds = new Set<string>();
  (friendships ?? []).forEach((row) => {
    const otherId =
      row.requester_id === user.id ? row.addressee_id : row.requester_id;
    friendIds.add(otherId);
  });

  const friendIdList = Array.from(friendIds);
  if (friendIdList.length === 0) {
    return NextResponse.json({ items: [] });
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, role")
    .in("id", friendIdList);

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile as ActivityProfile])
  );

  const { data: followRows } = await supabase
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
    .limit(20);

  const { data: newGames } = await supabase
    .from("games")
    .select("id, title, cover_url, genre, created_at, owner_id")
    .in("owner_id", friendIdList)
    .order("created_at", { ascending: false })
    .limit(20);

  const followItems: ActivityEntry[] = (followRows ?? []).flatMap((row) => {
    const game = (row.games as ActivityGame[] | null)?.[0] || null;
    const profile = profileMap.get(row.user_id);
    if (!game || !profile) return [];
    return [
      {
        id: `follow-${row.id}`,
        type: "follow",
        created_at: row.created_at,
        user: profile,
        game,
      },
    ];
  });

  const launchItems: ActivityEntry[] = (newGames ?? []).flatMap((game) => {
    const profile = profileMap.get(game.owner_id);
    if (!profile) return [];
    return [
      {
        id: `launch-${game.id}`,
        type: "launch",
        created_at: game.created_at,
        user: profile,
        game: {
          id: game.id,
          title: game.title,
          cover_url: game.cover_url,
          genre: game.genre,
        },
      },
    ];
  });

  const items = [...followItems, ...launchItems]
    .sort((a, b) => {
      const diff =
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (diff !== 0) return diff;
      return a.id.localeCompare(b.id);
    })
    .slice(0, 20);

  return NextResponse.json({ items });
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type FriendProfile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string | null;
};

type FriendEntry = {
  id: string;
  user_id: string;
  user: FriendProfile;
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
    .select("id, requester_id, addressee_id, status")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

  const friendIds = new Set<string>();
  (friendships ?? []).forEach((row) => {
    const otherId =
      row.requester_id === user.id ? row.addressee_id : row.requester_id;
    friendIds.add(otherId);
  });

  const { data: profiles } = friendIds.size
    ? await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, role")
        .in("id", Array.from(friendIds))
    : { data: [] };

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile as FriendProfile])
  );

  const incoming: FriendEntry[] = [];
  const accepted: FriendEntry[] = [];

  (friendships ?? []).forEach((row) => {
    if (row.status === "pending" && row.addressee_id === user.id) {
      const profile = profileMap.get(row.requester_id);
      if (!profile) return;
      incoming.push({
        id: row.id,
        user_id: row.requester_id,
        user: profile,
      });
    }

    if (row.status === "accepted") {
      const otherId =
        row.requester_id === user.id ? row.addressee_id : row.requester_id;
      const profile = profileMap.get(otherId);
      if (!profile) return;
      accepted.push({
        id: row.id,
        user_id: otherId,
        user: profile,
      });
    }
  });

  return NextResponse.json({ incoming, accepted });
}

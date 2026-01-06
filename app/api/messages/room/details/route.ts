import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");

  if (!roomId) {
    return NextResponse.json({ error: "Missing room." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: room, error: roomError } = await supabase
    .from("chat_rooms")
    .select("id, name, is_group, direct_user_a, direct_user_b")
    .eq("id", roomId)
    .maybeSingle();

  if (roomError) {
    return NextResponse.json({ error: roomError.message }, { status: 500 });
  }

  if (!room) {
    return NextResponse.json({ error: "Room not found." }, { status: 404 });
  }

  const { data: messages, error: messagesError } = await supabase
    .from("chat_messages")
    .select("id, room_id, sender_id, content, created_at")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true })
    .limit(200);

  if (messagesError) {
    return NextResponse.json({ error: messagesError.message }, { status: 500 });
  }

  const { data: memberRows, error: membersError } = await supabase
    .from("chat_members")
    .select("user_id")
    .eq("room_id", roomId);

  if (membersError) {
    return NextResponse.json({ error: membersError.message }, { status: 500 });
  }

  const memberIds = memberRows?.map((row) => row.user_id) ?? [];
  const { data: memberProfiles, error: profilesError } = memberIds.length
    ? await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", memberIds)
    : { data: [] };

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  let roomLabel = room.is_group ? room.name ?? "Group chat" : "Direct chat";

  if (!room.is_group && room.direct_user_a && room.direct_user_b) {
    const otherId =
      room.direct_user_a === user.id
        ? room.direct_user_b
        : room.direct_user_a;
    const otherProfile = (memberProfiles ?? []).find(
      (profile) => profile.id === otherId
    );
    if (otherProfile?.display_name) {
      roomLabel = otherProfile.display_name;
    }
  }

  return NextResponse.json({
    roomId: room.id,
    roomLabel,
    is_group: room.is_group,
    participants: memberProfiles ?? [],
    messages: messages ?? [],
  });
}

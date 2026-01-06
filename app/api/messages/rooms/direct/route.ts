import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    friendId?: string;
  } | null;
  const friendId = body?.friendId?.trim();

  if (!friendId) {
    return NextResponse.json({ error: "Missing friend." }, { status: 400 });
  }

  if (friendId === user.id) {
    return NextResponse.json(
      { error: "Cannot message yourself." },
      { status: 400 }
    );
  }

  const { data: friendship } = await supabase
    .from("friendships")
    .select("status")
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${friendId}),and(requester_id.eq.${friendId},addressee_id.eq.${user.id})`
    )
    .maybeSingle();

  if (!friendship || friendship.status !== "accepted") {
    return NextResponse.json(
      { error: "You can only message friends." },
      { status: 403 }
    );
  }

  const { data: existing } = await supabase
    .from("chat_rooms")
    .select("id")
    .or(
      `and(direct_user_a.eq.${user.id},direct_user_b.eq.${friendId}),and(direct_user_a.eq.${friendId},direct_user_b.eq.${user.id})`
    )
    .maybeSingle();

  if (existing?.id) {
    return NextResponse.json({ roomId: existing.id });
  }

  const { data: room, error: roomError } = await supabase
    .from("chat_rooms")
    .insert({
      name: null,
      is_group: false,
      created_by: user.id,
      direct_user_a: user.id,
      direct_user_b: friendId,
    })
    .select("id")
    .single();

  if (roomError?.code === "23505") {
    const { data: fallback } = await supabase
      .from("chat_rooms")
      .select("id")
      .or(
        `and(direct_user_a.eq.${user.id},direct_user_b.eq.${friendId}),and(direct_user_a.eq.${friendId},direct_user_b.eq.${user.id})`
      )
      .maybeSingle();

    if (fallback?.id) {
      return NextResponse.json({ roomId: fallback.id });
    }
  }

  if (roomError || !room) {
    return NextResponse.json(
      { error: roomError?.message ?? "Failed to create room." },
      { status: 500 }
    );
  }

  const { error: membersError } = await supabase.from("chat_members").insert([
    { room_id: room.id, user_id: user.id, role: "admin" },
    { room_id: room.id, user_id: friendId, role: "member" },
  ]);

  if (membersError) {
    return NextResponse.json({ error: membersError.message }, { status: 500 });
  }

  return NextResponse.json({ roomId: room.id });
}

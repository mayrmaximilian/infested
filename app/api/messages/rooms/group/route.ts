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
    name?: string;
    members?: string[] | string;
  } | null;

  const name = body?.name?.trim() ?? "";
  if (name.length < 2) {
    return NextResponse.json(
      { error: "Group name is too short." },
      { status: 400 }
    );
  }

  const rawMembers = body?.members ?? [];
  const memberIds = Array.isArray(rawMembers)
    ? rawMembers
    : typeof rawMembers === "string"
      ? rawMembers.split(",")
      : [];

  const uniqueMembers = Array.from(
    new Set([user.id, ...memberIds.map((id) => id.trim()).filter(Boolean)])
  );

  const { data: room, error: roomError } = await supabase
    .from("chat_rooms")
    .insert({
      name,
      is_group: true,
      created_by: user.id,
      direct_user_a: null,
      direct_user_b: null,
    })
    .select("id")
    .single();

  if (roomError || !room) {
    return NextResponse.json(
      { error: roomError?.message ?? "Failed to create room." },
      { status: 500 }
    );
  }

  const memberRows = uniqueMembers.map((memberId) => ({
    room_id: room.id,
    user_id: memberId,
    role: memberId === user.id ? "admin" : "member",
  }));

  const { error: membersError } = await supabase
    .from("chat_members")
    .insert(memberRows);

  if (membersError) {
    return NextResponse.json({ error: membersError.message }, { status: 500 });
  }

  return NextResponse.json({ roomId: room.id });
}

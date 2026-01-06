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
    roomId?: string;
    content?: string;
  } | null;

  const roomId = body?.roomId;
  const content = body?.content?.trim();

  if (!roomId || !content) {
    return NextResponse.json(
      { error: "Room and content required." },
      { status: 400 }
    );
  }

  const { data, error: insertError } = await supabase
    .from("chat_messages")
    .insert({
      room_id: roomId,
      sender_id: user.id,
      content,
    })
    .select("id, room_id, sender_id, content, created_at")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ message: data });
}

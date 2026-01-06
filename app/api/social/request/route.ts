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
    targetId?: string;
  } | null;

  const targetId = body?.targetId;
  if (!targetId || typeof targetId !== "string") {
    return NextResponse.json({ error: "Missing user." }, { status: 400 });
  }

  if (targetId === user.id) {
    return NextResponse.json({ error: "Cannot friend yourself." }, { status: 400 });
  }

  const { error: insertError } = await supabase.from("friendships").insert({
    requester_id: user.id,
    addressee_id: targetId,
    status: "pending",
  });

  if (insertError) {
    const status = insertError.code === "23505" ? 409 : 500;
    return NextResponse.json({ error: insertError.message }, { status });
  }

  return NextResponse.json({ success: true });
}

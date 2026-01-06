import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error: searchError } = await supabase
    .from("games")
    .select("id, title, cover_url, genre")
    .ilike("title", `%${q}%`)
    .limit(8);

  if (searchError) {
    return NextResponse.json({ error: searchError.message }, { status: 500 });
  }

  return NextResponse.json({ results: data ?? [] });
}

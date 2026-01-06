import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RelationshipRow = {
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted" | "blocked";
};

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
    .from("profiles")
    .select("id, display_name, avatar_url, role")
    .ilike("display_name", `%${q}%`)
    .limit(8);

  if (searchError) {
    return NextResponse.json({ error: searchError.message }, { status: 500 });
  }

  const results = (data ?? []).filter((profile) => profile.id !== user.id);
  const ids = results.map((profile) => profile.id);
  const { data: relationships } = ids.length
    ? await supabase
        .from("friendships")
        .select("requester_id, addressee_id, status")
        .or(
          `and(requester_id.eq.${user.id},addressee_id.in.(${ids.join(
            ","
          )})),and(addressee_id.eq.${user.id},requester_id.in.(${ids.join(",")}))`
        )
    : { data: [] };

  const relationshipMap = new Map<string, RelationshipRow["status"]>();
  (relationships as RelationshipRow[] | null)?.forEach((row) => {
    const otherId =
      row.requester_id === user.id ? row.addressee_id : row.requester_id;
    relationshipMap.set(otherId, row.status);
  });

  const enriched = results.map((profile) => ({
    ...profile,
    relationship_status: relationshipMap.get(profile.id) ?? null,
  }));

  return NextResponse.json({ results: enriched });
}

import Link from "next/link";
import NextImage from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

export default async function MyGamesPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role =
    (profile?.role || (user.user_metadata as { role?: string })?.role || "").toLowerCase();
  if (role !== "developer") {
    redirect("/app");
  }

  const { data: games, error: gamesError } = await supabase
    .from("games")
    .select("id, title, summary, hero_url, created_at, genre")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/50">Game pages</p>
          <h1 className="text-3xl font-semibold">Your landing pages</h1>
          <p className="text-white/60">Manage the public pages for your games.</p>
        </div>
        <Button asChild>
          <Link href="/app/games/new">Create new page</Link>
        </Button>
      </div>

      <Separator />

      {gamesError ? (
        <Card className="border-red-500/40 bg-red-500/10">
          <CardHeader>
            <CardTitle className="text-red-200">Couldn&apos;t load games</CardTitle>
            <CardDescription className="text-red-200/80">
              {gamesError.message || "Unexpected error fetching your games."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : games && games.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {games
            .filter((g) => Boolean(g.id))
            .map((game) => (
              <Card key={game.id} className="border-[#1f2128] bg-[#0b0d12]">
              <CardHeader className="flex flex-row items-start gap-3">
                <div className="relative h-16 w-24 overflow-hidden rounded-md border border-[#1f2128] bg-[#0a0b0f]">
                  {game.hero_url ? (
                    <NextImage
                      src={game.hero_url}
                      alt={game.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-white/50">
                      No art
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg">{game.title}</CardTitle>
                  <CardDescription className="line-clamp-2 text-white/60">
                    {game.summary}
                  </CardDescription>
                  {game.genre ? (
                    <p className="text-xs text-[#D946EF] uppercase tracking-[0.18em]">
                      {game.genre}
                    </p>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-xs text-white/50">
                  {new Date(game.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" variant="secondary">
                    <Link href={`/app/games/${game.id}`}>View page</Link>
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/app/games/${game.id}/edit`}>Edit page</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-[#1f2128] bg-[#0b0d12]">
          <CardHeader>
            <CardTitle>No game pages yet</CardTitle>
            <CardDescription>
              Create your first landing page to showcase your game to players.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/app/games/new">Create a page</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { Library, Gamepad2 } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch games the user is following
  const { data: followedGames } = await supabase
    .from("game_follows")
    .select(
      `
      game_id,
      created_at,
      games!inner (
        id,
        title,
        cover_url,
        genre,
        status,
        summary
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Transform the data for our components
  type GameType = {
    id: string;
    title: string;
    cover_url: string | null;
    genre: string | null;
    status: string | null;
    summary: string | null;
  };

  const games: GameType[] = (followedGames ?? [])
    .map((f) => {
      const g = f.games as unknown as GameType;
      return g;
    })
    .filter(
      (g): g is GameType => g !== null && typeof g === "object" && "id" in g
    );

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-1">
        <p className="text-sm uppercase tracking-[0.2em] text-white/50">
          your collection
        </p>
        <h1 className="text-3xl font-semibold">Library</h1>
        <p className="text-white/60">
          Games you&apos;re following. Stay updated on their progress and
          releases.
        </p>
      </header>

      {/* Games Grid or Slider */}
      {games.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-[#D946EF]/20 to-[#D946EF]/5">
              <Library className="h-5 w-5 text-[#D946EF]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Following</h2>
              <p className="text-sm text-white/50">
                {games.length} game{games.length !== 1 ? "s" : ""} in your
                library
              </p>
            </div>
          </div>

          {/* Grid view for library */}
          <div className="flex flex-wrap gap-4">
            {games.map((game) => (
              <Link
                key={game.id}
                href={`/app/games/${game.id}`}
                className="group relative overflow-hidden rounded-lg border border-[#1f2128] bg-black/50 transition-transform hover:scale-105"
                style={{ width: "250px", height: "312px" }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                  }}
                >
                  {game.cover_url ? (
                    <img
                      src={game.cover_url}
                      alt={game.title}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                    />
                  ) : (
                    <div
                      className="absolute inset-0 bg-linear-to-br from-[#D946EF]/20 to-[#22D3EE]/20"
                      style={{ position: "absolute", inset: 0 }}
                    />
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                  {/* Title on hover */}
                  <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full transition-transform group-hover:translate-y-0">
                    <p className="text-sm font-medium truncate">{game.title}</p>
                    <p className="text-xs text-white/60 capitalize">
                      {game.genre || "Indie"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#1f2128] bg-[#0b0d12] py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#D946EF]/10 mb-4">
            <Gamepad2 className="h-8 w-8 text-[#D946EF]" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Your library is empty</h2>
          <p className="text-white/60 text-center max-w-md mb-6">
            Start following games to add them to your library. You&apos;ll get
            updates on their development progress and release dates.
          </p>
          <Link href="/app">
            <Button className="gap-2">
              <Gamepad2 className="h-4 w-4" />
              Discover games
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

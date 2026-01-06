import {
  ArrowUpRight,
  Flame,
  Sparkles,
  TrendingUp,
  Clock,
  Star,
  Trophy,
  Library,
  Gift,
} from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { GameSlider } from "@/components/games/game-slider";
import { GameSearch } from "@/components/games/game-search";
import {
  getLeaderboard,
  getUserStats,
  getActiveTournaments,
} from "@/app/actions/gamification";
import { DashboardLeaderboard } from "@/components/gamification/dashboard-leaderboard";
import { TournamentsWidget } from "@/components/gamification/tournaments-widget";

export const dynamic = "force-dynamic";

export default async function AppPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, role")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    profile?.display_name ||
    (user.user_metadata as { name?: string })?.name ||
    user.email?.split("@")[0] ||
    "Pilot";

  // Fetch newest games (most recently created)
  const { data: newestGames } = await supabase
    .from("games")
    .select("id, title, cover_url, genre, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  // Fetch hottest games (most wishlisted/followed)
  const { data: hottestGames } = await supabase
    .from("games")
    .select("id, title, cover_url, genre, wishlist_count, followers_count")
    .order("wishlist_count", { ascending: false })
    .limit(10);

  // For recommended, we'll show a random mix or games user hasn't seen
  const { data: recommendedGames } = await supabase
    .from("games")
    .select("id, title, cover_url, genre")
    .order("updated_at", { ascending: false })
    .limit(10);

  // Fetch leaderboard data, user stats, and tournaments
  const [leaderboardEntries, userStats, tournaments] = await Promise.all([
    getLeaderboard(20),
    getUserStats(),
    getActiveTournaments(),
  ]);

  // Count user's followed games
  const { count: followedCount } = await supabase
    .from("game_follows")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (
    <div className="space-y-6">
      {/* Hero Header with Stats */}
      <header className="rounded-2xl border border-[#1f2128] bg-gradient-to-br from-[#0b0d12] via-[#0f0f18] to-[#1a0f1c] p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="text-sm uppercase tracking-[0.2em] text-white/50">
              cockpit
            </p>
            <h1 className="text-2xl font-semibold lg:text-3xl">
              Welcome back, {displayName}
            </h1>
            <p className="text-sm text-white/60">
              Discover indie games, track drops, and climb the ranks.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-2 ring-1 ring-white/10">
              <Trophy className="h-5 w-5 text-[#D946EF]" />
              <div>
                <p className="text-xs text-white/50">Level</p>
                <p className="font-semibold">{userStats?.level ?? 1}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-2 ring-1 ring-white/10">
              <Star className="h-5 w-5 text-[#22D3EE]" />
              <div>
                <p className="text-xs text-white/50">XP</p>
                <p className="font-semibold">
                  {(userStats?.monthly_xp ?? 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-2 ring-1 ring-white/10">
              <Library className="h-5 w-5 text-emerald-400" />
              <div>
                <p className="text-xs text-white/50">Following</p>
                <p className="font-semibold">{followedCount ?? 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <GameSearch />
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        {/* Left Column - Games */}
        <div className="space-y-8 min-w-0">
          {/* Hottest Games */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#D946EF]/20 to-[#D946EF]/5">
                  <TrendingUp className="h-4 w-4 text-[#D946EF]" />
                </div>
                <h2 className="text-lg font-semibold">Trending</h2>
              </div>
              <Link href="/app/games">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  View all
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <GameSlider
              games={hottestGames ?? []}
              emptyMessage="No hot games yet."
            />
          </section>

          {/* New Releases */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#22D3EE]/20 to-[#22D3EE]/5">
                  <Clock className="h-4 w-4 text-[#22D3EE]" />
                </div>
                <h2 className="text-lg font-semibold">New Releases</h2>
              </div>
              <Link href="/app/games">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  View all
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <GameSlider
              games={newestGames ?? []}
              emptyMessage="No games yet."
            />
          </section>

          {/* Recommended */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400/20 to-emerald-400/5">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                </div>
                <h2 className="text-lg font-semibold">For You</h2>
              </div>
              <Link href="/app/games">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  View all
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <GameSlider
              games={recommendedGames ?? []}
              emptyMessage="Follow more games to get recommendations!"
            />
          </section>
        </div>

        {/* Right Column - Leaderboard & Tournaments */}
        <aside className="space-y-6">
          {/* Top Players */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#D946EF]/20 to-[#D946EF]/5">
                  <Trophy className="h-4 w-4 text-[#D946EF]" />
                </div>
                <h2 className="text-lg font-semibold">Top Players</h2>
              </div>
              <Link href="/app/leaderboard">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  Full list
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <DashboardLeaderboard
              entries={leaderboardEntries}
              currentUserId={user.id}
            />
          </div>

          {/* Weekly Tournaments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/5">
                  <Gift className="h-4 w-4 text-amber-400" />
                </div>
                <h2 className="text-lg font-semibold">Weekly Challenges</h2>
              </div>
            </div>
            <TournamentsWidget tournaments={tournaments} />
          </div>
        </aside>
      </div>
    </div>
  );
}

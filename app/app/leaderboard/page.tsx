import { Trophy, ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Leaderboard,
  LeaderboardCard,
} from "@/components/gamification/leaderboard";
import { getLeaderboard, getUserStats } from "@/app/actions/gamification";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [leaderboard, userStats] = await Promise.all([
    getLeaderboard(10),
    getUserStats(),
  ]);

  // Find user's rank
  const userRank = leaderboard.findIndex((e) => e.user_id === user.id) + 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-1">
        <Link
          href="/app"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Overview
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D946EF]/20 to-[#22D3EE]/20 ring-1 ring-white/10">
            <Trophy className="h-7 w-7 text-[#D946EF]" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-white/50">
              community
            </p>
            <h1 className="text-3xl font-semibold">Monthly Leaderboard</h1>
          </div>
        </div>
        <p className="text-white/60 mt-2">
          Rankings reset at the start of each month. Climb the ranks by
          exploring games, pitching ideas, and staying active!
        </p>
      </header>

      {/* How to earn XP */}
      <div className="rounded-2xl border border-[#1f2128] bg-gradient-to-br from-[#0b0d12] via-[#0f0f18] to-[#0b0d12] p-6">
        <h2 className="text-xl font-semibold mb-4">How to Earn XP</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { action: "Follow a game", xp: 25, icon: "🎮" },
            { action: "Submit a pitch", xp: 50, icon: "💡" },
            { action: "Vote on pitches", xp: 10, icon: "🗳️" },
            { action: "Daily login bonus", xp: 15, icon: "📅" },
          ].map((item) => (
            <div
              key={item.action}
              className="flex items-center gap-3 rounded-xl bg-white/5 p-4 ring-1 ring-white/10"
            >
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-sm font-medium">{item.action}</p>
                <p className="text-sm text-[#D946EF]">+{item.xp} XP</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User's rank card */}
      {userStats && userRank > 0 && (
        <LeaderboardCard
          rank={userRank}
          totalPlayers={leaderboard.length}
          xp={userStats.total_xp ?? 0}
          level={userStats.level ?? 1}
        />
      )}

      {/* Main leaderboard */}
      <div className="rounded-2xl border border-[#1f2128] bg-[#0b0d12] p-6">
        <Leaderboard
          entries={leaderboard}
          currentUserId={user.id}
          showFullList
        />
      </div>
    </div>
  );
}

import {
  Target,
  ArrowLeft,
  Clock,
  Users,
  Gift,
  Trophy,
  Zap,
  Gamepad2,
} from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getActiveTournaments, getUserStats } from "@/app/actions/gamification";
import { ChallengesList } from "@/components/gamification/challenges-list";

export const dynamic = "force-dynamic";

export default async function ChallengesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [tournaments, userStats] = await Promise.all([
    getActiveTournaments(),
    getUserStats(),
  ]);

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
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 ring-1 ring-amber-500/20">
            <Target className="h-7 w-7 text-amber-400" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-white/50">
              sponsored
            </p>
            <h1 className="text-3xl font-semibold">Weekly Challenges</h1>
          </div>
        </div>
        <p className="text-white/60 mt-2">
          Compete in sponsored challenges to win cash prizes, exclusive badges,
          and XP rewards. New challenges every week!
        </p>
      </header>

      {/* Prize Info Banner */}
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 ring-1 ring-emerald-500/30">
            <Gift className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-emerald-400">
              €200 Cash Prize
            </h2>
            <p className="text-sm text-white/60">
              Each challenge awards €200 to the overall winner, plus bonus XP
              and exclusive rewards!
            </p>
          </div>
        </div>
      </div>

      {/* Challenge Types */}
      <div className="rounded-2xl border border-[#1f2128] bg-gradient-to-br from-[#0b0d12] via-[#0f0f18] to-[#0b0d12] p-6">
        <h2 className="text-xl font-semibold mb-4">Challenge Types</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              type: "XP Target",
              desc: "Earn XP through activity",
              icon: Zap,
              color: "text-yellow-400",
            },
            {
              type: "Leaderboard",
              desc: "Reach a target rank",
              icon: Trophy,
              color: "text-purple-400",
            },
            {
              type: "Pitches",
              desc: "Submit game pitches",
              icon: Gamepad2,
              color: "text-cyan-400",
            },
            {
              type: "Follows",
              desc: "Follow new games",
              icon: Target,
              color: "text-pink-400",
            },
          ].map((item) => (
            <div
              key={item.type}
              className="flex items-center gap-3 rounded-xl bg-white/5 p-4 ring-1 ring-white/10"
            >
              <item.icon className={`h-5 w-5 ${item.color}`} />
              <div>
                <p className="text-sm font-medium">{item.type}</p>
                <p className="text-xs text-white/50">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Challenges */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Active Challenges</h2>
        {tournaments.length === 0 ? (
          <div className="rounded-2xl border border-[#1f2128] bg-[#0b0d12] p-12 text-center">
            <Target className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <p className="text-lg font-medium text-white/60">
              No Active Challenges
            </p>
            <p className="text-sm text-white/40 mt-1">
              Check back soon for new sponsored challenges!
            </p>
          </div>
        ) : (
          <ChallengesList tournaments={tournaments} userStats={userStats} />
        )}
      </div>

      {/* Your Stats */}
      {userStats && (
        <div className="rounded-2xl border border-[#1f2128] bg-gradient-to-br from-[#0b0d12] via-[#0f0f18] to-[#0b0d12] p-6">
          <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-wider text-white/50 mb-1">
                Monthly XP
              </p>
              <p className="text-2xl font-bold text-[#D946EF]">
                {userStats.monthly_xp?.toLocaleString() || 0}
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-wider text-white/50 mb-1">
                Total XP
              </p>
              <p className="text-2xl font-bold">
                {userStats.total_xp?.toLocaleString() || 0}
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-wider text-white/50 mb-1">
                Level
              </p>
              <p className="text-2xl font-bold text-[#22D3EE]">
                {userStats.level || 1}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

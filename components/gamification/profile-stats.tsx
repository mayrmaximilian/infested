"use client";

import Link from "next/link";
import { Trophy, Flame, Zap, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LevelBadge,
  XPProgressBar,
  StreakBadge,
  AchievementsBadges,
} from "./achievements";

type UserStats = {
  xp: number;
  level: number;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  games_followed: number;
  pitches_submitted: number;
  pitches_voted: number;
};

type Achievement = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  xp_reward: number;
  requirement_type: string;
  requirement_value: number;
};

type UserAchievement = {
  unlocked_at: string;
  achievements: Achievement;
};

interface ProfileStatsProps {
  stats: UserStats;
  userAchievements: UserAchievement[];
  allAchievements: Achievement[];
  rank?: number;
  totalPlayers?: number;
  compact?: boolean;
}

export function ProfileStats({
  stats,
  userAchievements,
  allAchievements,
  rank,
  totalPlayers,
  compact = false,
}: ProfileStatsProps) {
  if (compact) {
    return (
      <div className="space-y-3">
        {/* Level & XP */}
        <div className="flex items-center gap-3">
          <LevelBadge level={stats.level} size="md" />
          <div className="flex-1">
            <p className="text-sm font-medium">Level {stats.level}</p>
            <XPProgressBar
              currentXP={stats.total_xp}
              level={stats.level}
              showLabel={false}
            />
          </div>
        </div>

        {/* Streak */}
        {stats.current_streak > 0 && (
          <StreakBadge streak={stats.current_streak} />
        )}

        {/* Quick stats */}
        <div className="flex gap-2 text-xs text-white/50">
          <span>{stats.total_xp.toLocaleString()} XP</span>
          {rank && <span>• Rank #{rank}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with level */}
      <div className="flex items-center gap-4">
        <LevelBadge level={stats.level} size="lg" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-xl font-semibold">Level {stats.level}</p>
            {stats.current_streak > 0 && (
              <StreakBadge streak={stats.current_streak} />
            )}
          </div>
          <p className="text-sm text-white/50">
            {stats.total_xp.toLocaleString()} total XP
            {rank && totalPlayers && (
              <span>
                {" "}
                • Rank #{rank} of {totalPlayers.toLocaleString()}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* XP Progress */}
      <XPProgressBar currentXP={stats.total_xp} level={stats.level} />

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<Zap className="h-4 w-4 text-[#D946EF]" />}
          label="Total XP"
          value={stats.total_xp.toLocaleString()}
        />
        <StatCard
          icon={<Flame className="h-4 w-4 text-orange-400" />}
          label="Best Streak"
          value={`${stats.longest_streak} days`}
        />
        <StatCard
          icon={<span className="text-sm">🎮</span>}
          label="Following"
          value={stats.games_followed.toString()}
        />
        <StatCard
          icon={<span className="text-sm">💡</span>}
          label="Pitches"
          value={stats.pitches_submitted.toString()}
        />
      </div>

      {/* Achievements */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[#D946EF]" />
            Achievements
            <span className="text-sm font-normal text-white/50">
              {userAchievements.length}/{allAchievements.length}
            </span>
          </h3>
          <Link
            href="/app/achievements"
            className="flex items-center gap-1 text-xs text-white/50 hover:text-[#D946EF]"
          >
            View all
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <AchievementsBadges
          userAchievements={userAchievements}
          allAchievements={allAchievements}
          showLocked={true}
          maxDisplay={12}
        />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-white/50">{label}</span>
      </div>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

interface SidebarStatsProps {
  stats: UserStats;
  rank?: number;
}

export function SidebarStats({ stats, rank }: SidebarStatsProps) {
  return (
    <Link
      href="/app/leaderboard"
      className="block rounded-xl border border-[#1f2128] bg-gradient-to-br from-[#0b0d12] to-[#0f0f18] p-4 transition-all hover:border-[#D946EF]/30"
    >
      <div className="flex items-center gap-3">
        <LevelBadge level={stats.level} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Level {stats.level}</p>
            {stats.current_streak > 0 && (
              <span className="flex items-center gap-1 text-xs text-orange-400">
                <Flame className="h-3 w-3" />
                {stats.current_streak}
              </span>
            )}
          </div>
          <XPProgressBar
            currentXP={stats.total_xp}
            level={stats.level}
            showLabel={false}
          />
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-white/50">
        <span>{stats.total_xp.toLocaleString()} XP</span>
        {rank && (
          <span className="flex items-center gap-1">
            <Trophy className="h-3 w-3" />#{rank}
          </span>
        )}
      </div>
    </Link>
  );
}

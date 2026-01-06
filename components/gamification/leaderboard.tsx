"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Medal,
  Crown,
  Flame,
  Target,
  Lightbulb,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LevelBadge } from "./achievements";

type LeaderboardEntry = {
  rank: number;
  user_id: string;
  total_xp: number;
  monthly_xp: number;
  level: number;
  current_streak: number;
  games_followed: number;
  pitches_submitted: number;
  profile: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  showFullList?: boolean;
}

export function Leaderboard({
  entries,
  currentUserId,
  showFullList = false,
}: LeaderboardProps) {
  const [filter, setFilter] = useState<
    "xp" | "streak" | "explorer" | "creator"
  >("xp");

  const sortedEntries = [...entries].sort((a, b) => {
    switch (filter) {
      case "streak":
        return b.current_streak - a.current_streak;
      case "explorer":
        return b.games_followed - a.games_followed;
      case "creator":
        return b.pitches_submitted - a.pitches_submitted;
      default:
        return b.monthly_xp - a.monthly_xp;
    }
  });

  const displayEntries = showFullList
    ? sortedEntries
    : sortedEntries.slice(0, 10);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-amber-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-zinc-300" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-white/40 font-mono">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1)
      return "bg-gradient-to-r from-amber-500/20 to-transparent border-amber-500/30";
    if (rank === 2)
      return "bg-gradient-to-r from-zinc-400/10 to-transparent border-zinc-400/20";
    if (rank === 3)
      return "bg-gradient-to-r from-amber-700/10 to-transparent border-amber-700/20";
    return "border-white/5 hover:border-white/10 hover:bg-white/5";
  };

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: "xp", label: "Monthly XP", icon: Trophy },
          { key: "streak", label: "Streak", icon: Flame },
          { key: "explorer", label: "Explorer", icon: Target },
          { key: "creator", label: "Creator", icon: Lightbulb },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all whitespace-nowrap",
              filter === key
                ? "bg-[#D946EF]/20 text-[#D946EF] ring-1 ring-[#D946EF]/30"
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Leaderboard list */}
      <div className="space-y-2">
        {displayEntries.map((entry, index) => {
          const displayRank = index + 1;
          const isCurrentUser = entry.user_id === currentUserId;

          return (
            <div
              key={entry.user_id}
              className={cn(
                "flex items-center gap-4 rounded-xl border p-4 transition-all",
                getRankBg(displayRank),
                isCurrentUser && "ring-2 ring-[#D946EF]/50"
              )}
            >
              {/* Rank */}
              <div className="flex h-10 w-10 items-center justify-center">
                {getRankIcon(displayRank)}
              </div>

              {/* Avatar */}
              <div className="relative">
                {entry.profile?.avatar_url ? (
                  <img
                    src={entry.profile.avatar_url}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-white/10"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#D946EF]/30 to-[#22D3EE]/30 ring-2 ring-white/10">
                    <span className="text-lg font-bold">
                      {(entry.profile?.display_name || "?")[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1">
                  <LevelBadge level={entry.level} size="sm" />
                </div>
              </div>

              {/* Name & Stats */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {entry.profile?.display_name || "Anonymous Gamer"}
                  {isCurrentUser && (
                    <span className="ml-2 text-xs text-[#D946EF]">(You)</span>
                  )}
                </p>
                <div className="flex items-center gap-3 text-xs text-white/50">
                  <span className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    {entry.monthly_xp.toLocaleString()} XP this month
                  </span>
                  {entry.current_streak > 0 && (
                    <span className="flex items-center gap-1 text-orange-400">
                      <Flame className="h-3 w-3" />
                      {entry.current_streak}
                    </span>
                  )}
                </div>
              </div>

              {/* Primary metric based on filter */}
              <div className="text-right">
                {filter === "xp" && (
                  <p className="text-lg font-bold text-[#D946EF]">
                    {entry.monthly_xp.toLocaleString()}
                  </p>
                )}
                {filter === "streak" && (
                  <p className="text-lg font-bold text-orange-400">
                    {entry.current_streak} days
                  </p>
                )}
                {filter === "explorer" && (
                  <p className="text-lg font-bold text-[#22D3EE]">
                    {entry.games_followed} games
                  </p>
                )}
                {filter === "creator" && (
                  <p className="text-lg font-bold text-emerald-400">
                    {entry.pitches_submitted} pitches
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!showFullList && entries.length > 10 && (
        <Link
          href="/app/leaderboard"
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm text-white/60 transition-all hover:border-[#D946EF]/30 hover:text-[#D946EF]"
        >
          View full leaderboard
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

interface LeaderboardCardProps {
  rank: number;
  totalPlayers: number;
  xp: number;
  level: number;
}

export function LeaderboardCard({
  rank,
  totalPlayers,
  xp,
  level,
}: LeaderboardCardProps) {
  const percentile = Math.round((1 - rank / totalPlayers) * 100);

  return (
    <div className="rounded-xl border border-[#1f2128] bg-gradient-to-br from-[#0b0d12] via-[#0f0f18] to-[#1a0f1c] p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-white/50">Your Rank</p>
          <div className="flex items-center gap-3">
            <p className="text-4xl font-bold">#{rank}</p>
            <div className="rounded-full bg-[#D946EF]/20 px-3 py-1 text-xs text-[#D946EF]">
              Top {percentile}%
            </div>
          </div>
          <p className="text-sm text-white/40">
            of {totalPlayers.toLocaleString()} players
          </p>
        </div>

        <div className="text-right space-y-2">
          <LevelBadge level={level} size="lg" />
          <p className="text-sm text-white/50">{xp.toLocaleString()} XP</p>
        </div>
      </div>
    </div>
  );
}

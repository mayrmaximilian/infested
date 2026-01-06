"use client";

import Link from "next/link";
import { Trophy, Medal, Crown, Flame } from "lucide-react";

type LeaderboardEntry = {
  rank: number;
  user_id: string;
  display_name?: string | null;
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

interface DashboardLeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

export function DashboardLeaderboard({
  entries,
  currentUserId,
}: DashboardLeaderboardProps) {
  // Get top 5 by monthly XP
  const topPlayers = [...entries]
    .sort((a, b) => b.monthly_xp - a.monthly_xp)
    .slice(0, 5);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-4 w-4 text-amber-400" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-zinc-300" />;
    if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />;
    return <span className="text-xs font-mono text-white/40">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-amber-500/10 to-transparent";
    if (rank === 2) return "bg-gradient-to-r from-zinc-400/5 to-transparent";
    if (rank === 3) return "bg-gradient-to-r from-amber-700/5 to-transparent";
    return "";
  };

  return (
    <div className="rounded-xl border border-[#1f2128] bg-[#0b0d12] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#1f2128] bg-gradient-to-r from-white/5 to-transparent">
        <p className="text-xs uppercase tracking-wider text-white/50">
          Monthly Rankings
        </p>
      </div>

      {/* Leaderboard list */}
      <div className="divide-y divide-[#1f2128]/50">
        {topPlayers.map((entry, index) => {
          const isCurrentUser = entry.user_id === currentUserId;
          const displayName = entry.profile?.display_name || "Anonymous Gamer";
          const rank = index + 1;

          return (
            <div
              key={entry.user_id}
              className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/5 ${getRankBg(
                rank
              )} ${isCurrentUser ? "ring-1 ring-inset ring-[#D946EF]/30" : ""}`}
            >
              {/* Rank */}
              <div className="flex h-6 w-6 items-center justify-center">
                {getRankIcon(rank)}
              </div>

              {/* Avatar */}
              {entry.profile?.avatar_url ? (
                <img
                  src={entry.profile.avatar_url}
                  alt=""
                  className="h-9 w-9 rounded-full object-cover ring-1 ring-white/10"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#D946EF]/30 to-[#22D3EE]/30 ring-1 ring-white/10">
                  <span className="text-sm font-bold">
                    {displayName[0].toUpperCase()}
                  </span>
                </div>
              )}

              {/* Name & Level */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {displayName}
                  {isCurrentUser && (
                    <span className="ml-1.5 text-xs text-[#D946EF]">(You)</span>
                  )}
                </p>
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <span>Lvl {entry.level}</span>
                  {entry.current_streak > 0 && (
                    <span className="flex items-center gap-0.5 text-orange-400">
                      <Flame className="h-3 w-3" />
                      {entry.current_streak}
                    </span>
                  )}
                </div>
              </div>

              {/* XP */}
              <div className="text-right">
                <p className="text-sm font-semibold text-[#D946EF]">
                  {entry.monthly_xp.toLocaleString()}
                </p>
                <p className="text-xs text-white/40">XP</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer link */}
      <Link
        href="/app/leaderboard"
        className="flex items-center justify-center gap-1 py-3 text-xs text-white/50 transition-colors hover:text-[#D946EF] hover:bg-white/5 border-t border-[#1f2128]"
      >
        View all rankings
        <Trophy className="h-3 w-3" />
      </Link>
    </div>
  );
}

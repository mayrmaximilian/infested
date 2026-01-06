"use client";

import { useEffect, useState } from "react";
import {
  Trophy,
  Target,
  Clock,
  Users,
  Zap,
  Gift,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Gamepad2,
  Calendar,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { joinTournament, leaveTournament } from "@/app/actions/gamification";

type Tournament = {
  id: string;
  title: string;
  description: string | null;
  sponsor_name: string;
  sponsor_logo_url: string | null;
  game_id: string | null;
  challenge_type: string;
  challenge_target: number;
  prize_description: string;
  prize_xp: number;
  cash_prize_amount: number | null;
  cash_prize_currency: string | null;
  starts_at: string;
  ends_at: string;
  games: {
    id: string;
    title: string;
    cover_url: string | null;
  }[];
  participant_count: number;
  user_entry: {
    current_progress: number;
    is_completed: boolean;
  } | null;
};

type UserStats = {
  total_xp: number;
  monthly_xp: number;
  level: number;
  current_streak: number;
} | null;

interface ChallengesListProps {
  tournaments: Tournament[];
  userStats: UserStats;
}

export function ChallengesList({
  tournaments,
  userStats,
}: ChallengesListProps) {
  const [joining, setJoining] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<string | null>(null);
  const [joined, setJoined] = useState<Set<string>>(
    new Set(tournaments.filter((t) => t.user_entry).map((t) => t.id))
  );
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case "leaderboard_rank":
        return Trophy;
      case "xp_target":
        return Zap;
      case "follows_target":
        return Target;
      case "pitches_target":
        return Gamepad2;
      default:
        return Target;
    }
  };

  const getChallengeLabel = (type: string, target: number) => {
    switch (type) {
      case "leaderboard_rank":
        return `Reach rank #${target} on the leaderboard`;
      case "xp_target":
        return `Earn ${target.toLocaleString()} XP this week`;
      case "follows_target":
        return `Follow ${target} games`;
      case "pitches_target":
        return `Submit ${target} game pitches`;
      default:
        return `Complete the challenge`;
    }
  };

  const getTimeRemaining = (endsAt: string) => {
    const end = new Date(endsAt);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days} days, ${hours} hours remaining`;
    if (hours > 0) return `${hours} hours, ${minutes} minutes remaining`;
    return `${minutes} minutes remaining`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleJoin = async (tournamentId: string) => {
    setJoining(tournamentId);
    const result = await joinTournament(tournamentId);
    if (result.success) {
      setJoined((prev) => new Set([...prev, tournamentId]));
    }
    setJoining(null);
  };

  const handleLeave = async (tournamentId: string) => {
    setLeaving(tournamentId);
    const result = await leaveTournament(tournamentId);
    if (result.success) {
      setJoined((prev) => {
        const newSet = new Set(prev);
        newSet.delete(tournamentId);
        return newSet;
      });
    }
    setLeaving(null);
  };

  const getProgress = (tournament: Tournament) => {
    if (!tournament.user_entry) return 0;
    const progress = tournament.user_entry.current_progress;
    const target = tournament.challenge_target;
    return Math.min((progress / target) * 100, 100);
  };

  return (
    <div className="space-y-4">
      {tournaments.map((tournament) => {
        const ChallengeIcon = getChallengeIcon(tournament.challenge_type);
        const isJoined = joined.has(tournament.id);
        const isCompleted = tournament.user_entry?.is_completed;
        const progress = getProgress(tournament);

        return (
          <div
            key={tournament.id}
            className="rounded-2xl border border-[#1f2128] bg-gradient-to-br from-[#0b0d12] via-[#0f0f18] to-[#0b0d12] overflow-hidden transition-all hover:border-[#D946EF]/30"
          >
            {/* Sponsor header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-[#1f2128] bg-white/[0.02]">
              <div className="flex items-center gap-3">
                {tournament.sponsor_logo_url ? (
                  <img
                    src={tournament.sponsor_logo_url}
                    alt={tournament.sponsor_name}
                    className="h-8 w-8 rounded-lg"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <Gift className="h-4 w-4 text-white/40" />
                  </div>
                )}
                <div>
                  <span className="text-xs text-white/50">Sponsored by</span>
                  <p className="text-sm font-medium">
                    {tournament.sponsor_name}
                  </p>
                </div>
              </div>
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Ends {isMounted ? formatDate(tournament.ends_at) : "—"}
                  </span>
                </div>
              </div>

            <div className="p-6">
              {/* Main content */}
              <div className="flex items-start gap-4 mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 ring-1 ring-amber-500/20 flex-shrink-0">
                  <ChallengeIcon className="h-7 w-7 text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">
                    {tournament.title}
                  </h3>
                  <p className="text-white/60">{tournament.description}</p>
                </div>
              </div>

              {/* Challenge target */}
              <div className="flex items-center gap-3 mb-6 rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
                <Target className="h-5 w-5 text-[#D946EF]" />
                <span className="text-base font-medium">
                  {getChallengeLabel(
                    tournament.challenge_type,
                    tournament.challenge_target
                  )}
                </span>
                {tournament.games && tournament.games.length > 0 && (
                  <span className="text-sm text-white/40 ml-auto">
                    Game: {tournament.games[0].title}
                  </span>
                )}
              </div>

              {/* Progress bar (if joined) */}
              {isJoined && (
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-white/60">Your Progress</span>
                    <span className="font-medium">
                      {tournament.user_entry?.current_progress || 0} /{" "}
                      {tournament.challenge_target}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#D946EF] to-[#22D3EE] transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Prizes */}
              <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 p-4 border border-emerald-500/20 mb-6">
                <h4 className="text-sm font-medium text-emerald-400 mb-3">
                  Prizes
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {tournament.cash_prize_amount &&
                    tournament.cash_prize_amount > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                          <span className="text-lg">💰</span>
                        </div>
                        <div>
                          <p className="font-semibold text-emerald-400">
                            €{tournament.cash_prize_amount}
                          </p>
                          <p className="text-xs text-white/50">
                            Overall Winner
                          </p>
                        </div>
                      </div>
                    )}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D946EF]/20">
                      <Zap className="h-5 w-5 text-[#D946EF]" />
                    </div>
                    <div>
                      <p className="font-semibold">+{tournament.prize_xp} XP</p>
                      <p className="text-xs text-white/50">Completion Bonus</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-white/60 mt-3 pt-3 border-t border-white/10">
                  {tournament.prize_description}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-white/50">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {isMounted ? getTimeRemaining(tournament.ends_at) : "—"}
                  </span>
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {tournament.participant_count} participants
                  </span>
                </div>

                {isCompleted ? (
                  <div className="flex items-center gap-2 text-emerald-400 font-medium">
                    <CheckCircle2 className="h-5 w-5" />
                    Challenge Completed!
                  </div>
                ) : isJoined ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-[#D946EF] font-medium">
                      <CheckCircle2 className="h-5 w-5" />
                      You&apos;re In!
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLeave(tournament.id)}
                      disabled={leaving === tournament.id}
                      className="text-white/50 hover:text-red-400 hover:bg-red-500/10"
                    >
                      {leaving === tournament.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <LogOut className="h-4 w-4 mr-1" />
                          Leave
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleJoin(tournament.id)}
                    disabled={joining === tournament.id}
                    className="gap-2"
                  >
                    {joining === tournament.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Join Challenge
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

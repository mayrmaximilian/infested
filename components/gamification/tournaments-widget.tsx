"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  X,
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
  } | null;
  participant_count: number;
  user_entry: {
    current_progress: number;
    is_completed: boolean;
  } | null;
};

interface TournamentsWidgetProps {
  tournaments: Tournament[];
}

export function TournamentsWidget({ tournaments }: TournamentsWidgetProps) {
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
        return `Reach rank #${target}`;
      case "xp_target":
        return `Earn ${target.toLocaleString()} XP`;
      case "follows_target":
        return `Follow ${target} games`;
      case "pitches_target":
        return `Submit ${target} pitches`;
      default:
        return `Complete challenge`;
    }
  };

  const getTimeRemaining = (endsAt: string) => {
    const end = new Date(endsAt);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
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

  if (tournaments.length === 0) {
    return (
      <div className="rounded-xl border border-[#1f2128] bg-[#0b0d12] p-6 text-center">
        <Gift className="h-8 w-8 text-white/20 mx-auto mb-2" />
        <p className="text-sm text-white/50">No active tournaments</p>
        <p className="text-xs text-white/30 mt-1">Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tournaments.map((tournament) => {
        const ChallengeIcon = getChallengeIcon(tournament.challenge_type);
        const isJoined = joined.has(tournament.id);
        const isCompleted = tournament.user_entry?.is_completed;

        return (
          <div
            key={tournament.id}
            className="group relative overflow-hidden rounded-xl border border-[#1f2128] bg-gradient-to-br from-[#0b0d12] via-[#0f0f18] to-[#0b0d12] transition-all hover:border-[#D946EF]/30"
          >
            {/* Sponsor header with logo */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1f2128] bg-white/[0.02]">
              {tournament.sponsor_logo_url ? (
                <img
                  src={tournament.sponsor_logo_url}
                  alt={tournament.sponsor_name}
                  className="h-5 w-5 rounded"
                />
              ) : (
                <Gift className="h-4 w-4 text-white/40" />
              )}
              <span className="text-xs font-medium text-white/60">
                Sponsored by{" "}
                <span className="text-white/80">{tournament.sponsor_name}</span>
              </span>
            </div>

            <div className="p-4">
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/10 ring-1 ring-amber-500/20">
                  <ChallengeIcon className="h-5 w-5 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">
                    {tournament.title}
                  </h3>
                  <p className="text-xs text-white/50 line-clamp-1">
                    {tournament.description}
                  </p>
                </div>
              </div>

              {/* Challenge target */}
              <div className="flex items-center gap-2 mb-3 rounded-lg bg-white/5 px-3 py-2">
                <Target className="h-4 w-4 text-[#D946EF]" />
                <span className="text-sm font-medium">
                  {getChallengeLabel(
                    tournament.challenge_type,
                    tournament.challenge_target
                  )}
                </span>
                {tournament.games && (
                  <span className="text-xs text-white/40">
                    in {tournament.games.title}
                  </span>
                )}
              </div>

              {/* Prize */}
              <div className="flex flex-col gap-2 mb-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 p-3 border border-emerald-500/20">
                {tournament.cash_prize_amount &&
                  tournament.cash_prize_amount > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-emerald-400">
                        €{tournament.cash_prize_amount}
                      </span>
                      <span className="text-xs text-white/50">
                        for overall winner
                      </span>
                    </div>
                  )}
                <div className="flex items-center gap-2 text-sm">
                  <Gift className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-white/70">
                    {tournament.prize_description}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-white/40">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {isMounted ? getTimeRemaining(tournament.ends_at) : "—"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {tournament.participant_count} joined
                  </span>
                </div>

                {isCompleted ? (
                  <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    Completed
                  </div>
                ) : isJoined ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-[#D946EF] text-sm font-medium">
                      <CheckCircle2 className="h-4 w-4" />
                      Joined
                    </span>
                    <button
                      onClick={() => handleLeave(tournament.id)}
                      disabled={leaving === tournament.id}
                      className="p-1 rounded hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                      title="Leave challenge"
                    >
                      {leaving === tournament.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleJoin(tournament.id)}
                    disabled={joining === tournament.id}
                    className="h-8 text-xs"
                  >
                    {joining === tournament.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <>
                        Join
                        <ChevronRight className="h-3 w-3 ml-1" />
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

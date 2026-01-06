"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { ThumbsUp, X, Lightbulb, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  submitPitchAction,
  votePitchAction,
  unvotePitchAction,
  deletePitchAction,
} from "@/app/actions/games";

type Pitch = {
  id: string;
  title: string;
  description: string | null;
  vote_count: number;
  user_id: string;
};

type ActionState =
  | { success: string; error?: undefined }
  | { error: string; success?: undefined }
  | undefined;

interface PitchItProps {
  gameId: string;
  pitches: Pitch[];
  userVotes: string[]; // Array of pitch IDs the user has voted for
  currentUserId: string | null;
  isOwner: boolean;
}

export function PitchIt({
  gameId,
  pitches,
  userVotes,
  currentUserId,
  isOwner,
}: PitchItProps) {
  const router = useRouter();
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [votingId, setVotingId] = useState<string | null>(null);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkScreen = () => setIsLargeScreen(window.innerWidth >= 1024);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const handleVote = async (pitchId: string) => {
    if (!currentUserId) {
      alert("You must be signed in to vote.");
      return;
    }

    setVotingId(pitchId);
    const hasVoted = userVotes.includes(pitchId);

    if (hasVoted) {
      await unvotePitchAction(pitchId, gameId);
    } else {
      await votePitchAction(pitchId, gameId);
    }

    setVotingId(null);
    router.refresh();
  };

  const handleDelete = async (pitchId: string) => {
    const result = await deletePitchAction(pitchId, gameId);
    if (result.error) {
      alert(result.error);
    }
    router.refresh();
  };

  // Get top 3 pitches by vote count
  const topPitches = [...pitches]
    .sort((a, b) => b.vote_count - a.vote_count)
    .slice(0, 3);

  const submitDialog = showSubmitDialog ? (
    <SubmitPitchDialog
      gameId={gameId}
      isLargeScreen={isLargeScreen}
      onClose={() => setShowSubmitDialog(false)}
      onSuccess={() => {
        setShowSubmitDialog(false);
        router.refresh();
      }}
    />
  ) : null;

  return (
    <div className="space-y-3">
      {topPitches.length === 0 ? (
        <p className="text-sm text-white/50">
          No feature requests yet. Be the first to pitch an idea!
        </p>
      ) : (
        topPitches.map((pitch, index) => {
          const hasVoted = userVotes.includes(pitch.id);
          const isVoting = votingId === pitch.id;
          const canDelete =
            isOwner || (currentUserId && pitch.user_id === currentUserId);

          return (
            <div
              key={pitch.id}
              className="flex items-center gap-3 rounded-md border border-[#1f2128] bg-white/5 px-3 py-3"
            >
              {/* Rank badge */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  index === 0
                    ? "bg-[#D946EF]/30 text-[#f5a6ff]"
                    : index === 1
                    ? "bg-[#22D3EE]/30 text-[#67e8f9]"
                    : "bg-white/10 text-white/70"
                }`}
              >
                #{index + 1}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">{pitch.title}</p>
                {pitch.description && (
                  <p className="truncate text-xs text-white/50">
                    {pitch.description}
                  </p>
                )}
              </div>

              {/* Vote count & button */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white/70">
                  {pitch.vote_count}
                </span>
                <Button
                  size="sm"
                  variant={hasVoted ? "default" : "secondary"}
                  className={`h-8 gap-1 ${
                    hasVoted ? "bg-[#D946EF] hover:bg-[#D946EF]/80" : ""
                  }`}
                  onClick={() => handleVote(pitch.id)}
                  disabled={isVoting || !currentUserId}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {hasVoted ? "Voted" : "Vote"}
                </Button>
                {canDelete && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    onClick={() => handleDelete(pitch.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })
      )}

      {/* Submit pitch button */}
      {currentUserId && (
        <Button
          size="sm"
          variant="ghost"
          className="mt-2 gap-2"
          onClick={() => setShowSubmitDialog(true)}
        >
          <Lightbulb className="h-4 w-4" />
          Pitch an idea
        </Button>
      )}

      {!currentUserId && (
        <p className="mt-2 text-xs text-white/40">
          Sign in to pitch ideas and vote
        </p>
      )}

      {mounted && submitDialog && createPortal(submitDialog, document.body)}
    </div>
  );
}

function SubmitPitchDialog({
  gameId,
  isLargeScreen,
  onClose,
  onSuccess,
}: {
  gameId: string;
  isLargeScreen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    submitPitchAction,
    undefined
  );

  useEffect(() => {
    if (state?.success) {
      onSuccess();
    }
  }, [state, onSuccess]);

  return (
    <>
      <div
        className="fixed inset-0 z-9998 bg-black/60"
        style={{
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          left: isLargeScreen ? "18rem" : 0,
        }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-0 z-9999 flex items-center justify-center"
        style={{ left: isLargeScreen ? "18rem" : 0 }}
      >
        <div className="pointer-events-auto relative mx-4 w-full max-w-md rounded-lg border border-[#1f2128] bg-[#0b0d12] p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-[#D946EF]" />
              <h2 className="text-lg font-semibold text-white">
                Pitch a Feature
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="mb-4 text-sm text-white/60">
            Share your idea for a new feature. The community will vote on the
            best ones!
          </p>

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="gameId" value={gameId} />

            <div className="space-y-2">
              <Label htmlFor="title">Feature Title</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="e.g., Co-op multiplayer mode"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe your feature idea..."
                maxLength={500}
                className="min-h-20 w-full rounded-md border border-[#1f2128] bg-[#0a0b0f] px-3 py-2 text-sm text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D946EF]/50"
              />
            </div>

            {state?.error && (
              <div className="rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {state.error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Submitting..." : "Submit Pitch"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

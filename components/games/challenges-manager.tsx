"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createChallengeAction,
  deleteChallengeAction,
} from "@/app/actions/games";

type Challenge = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  active: boolean;
};

type ActionState =
  | { success: string; error?: undefined }
  | { error: string; success?: undefined }
  | undefined;

interface ChallengesManagerProps {
  gameId: string;
  challenges: Challenge[];
  isOwner: boolean;
}

export function ChallengesManager({
  gameId,
  challenges,
  isOwner,
}: ChallengesManagerProps) {
  const router = useRouter();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = async (challengeId: string) => {
    setDeletingId(challengeId);
    const result = await deleteChallengeAction(challengeId, gameId);
    if (result.error) {
      alert(result.error);
    }
    setDeletingId(null);
    router.refresh();
  };

  const typeLabel = (type: string) => {
    switch (type) {
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      case "special":
        return "Special";
      default:
        return type;
    }
  };

  const createDialog = showCreateDialog ? (
    <CreateChallengeDialog
      gameId={gameId}
      onClose={() => setShowCreateDialog(false)}
      onSuccess={() => {
        setShowCreateDialog(false);
        router.refresh();
      }}
    />
  ) : null;

  return (
    <div className="space-y-3">
      {challenges.length === 0 ? (
        <p className="text-sm text-white/50">No challenges yet.</p>
      ) : (
        challenges.map((challenge) => (
          <div
            key={challenge.id}
            className="flex items-center justify-between rounded-md border border-[#1f2128] bg-white/5 px-3 py-2"
          >
            <div className="flex-1">
              <p className="text-white/80">{challenge.title}</p>
              {challenge.description && (
                <p className="text-xs text-white/50">{challenge.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#D946EF]/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#f5a6ff]">
                {typeLabel(challenge.type)}
              </span>
              {isOwner ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  onClick={() => handleDelete(challenge.id)}
                  disabled={deletingId === challenge.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : (
                <Button size="sm" variant="secondary">
                  Join
                </Button>
              )}
            </div>
          </div>
        ))
      )}

      {isOwner && (
        <Button
          size="sm"
          variant="ghost"
          className="mt-2 gap-2"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="h-4 w-4" />
          Add challenge
        </Button>
      )}

      {mounted && createDialog && createPortal(createDialog, document.body)}
    </div>
  );
}

function CreateChallengeDialog({
  gameId,
  onClose,
  onSuccess,
}: {
  gameId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createChallengeAction,
    undefined
  );

  useEffect(() => {
    if (state?.success) {
      onSuccess();
    }
  }, [state, onSuccess]);

  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsLargeScreen(window.innerWidth >= 1024);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

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
        className="fixed inset-0 z-9999 flex items-center justify-center pointer-events-none"
        style={{ left: isLargeScreen ? "18rem" : 0 }}
      >
        <div className="relative w-full max-w-md rounded-lg border border-[#1f2128] bg-[#0b0d12] p-6 shadow-lg mx-4 pointer-events-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Create Challenge
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="gameId" value={gameId} />

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="Weekly speedrun challenge"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <textarea
                id="description"
                name="description"
                placeholder="Beat act 1 under 8 minutes."
                maxLength={300}
                className="min-h-20 w-full rounded-md border border-[#1f2128] bg-[#0a0b0f] px-3 py-2 text-sm text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D946EF]/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                name="type"
                defaultValue="weekly"
                className="h-11 w-full rounded-md border border-[#1f2128] bg-[#0a0b0f] px-3 text-sm text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22D3EE]/70"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="special">Special</option>
              </select>
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
                {isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

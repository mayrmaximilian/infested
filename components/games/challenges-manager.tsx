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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  showHeader?: boolean;
}

export function ChallengesManager({
  gameId,
  challenges,
  isOwner,
  showHeader = true,
}: ChallengesManagerProps) {
  const router = useRouter();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const canUseDom = typeof document !== "undefined";
  const challengesList = Array.isArray(challenges) ? challenges : [];

  const challengeTypeConfig: Record<string, { label: string; color: string }> =
    {
      daily: { label: "Daily", color: "text-blue-400" },
      weekly: { label: "Weekly", color: "text-green-400" },
      monthly: { label: "Monthly", color: "text-yellow-400" },
      special: { label: "Special", color: "text-red-400" },
    };

  const handleDelete = async (challengeId: string) => {
    setIsDeleting(true);
    const result = await deleteChallengeAction(challengeId, gameId);
    if (result.error) {
      alert(result.error);
      setIsDeleting(false);
      return;
    }
    setSelectedChallenge(null);
    setIsDeleting(false);
    router.refresh();
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

  const selectedConfig = selectedChallenge
    ? challengeTypeConfig[selectedChallenge.type] ?? {
        label: selectedChallenge.type,
        color: "text-white/60",
      }
    : null;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-[#1f2128] bg-[#0b0d12] p-6">
        {showHeader && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Challenges</h2>
          </div>
        )}
        {challengesList.length === 0 ? (
          <p className="text-white/60 text-center py-8">No challenges yet</p>
        ) : (
          <div className="space-y-3">
            {challengesList.map((challenge) => {
              const config = challengeTypeConfig[challenge.type] ?? {
                label: challenge.type,
                color: "text-white/60",
              };
              return (
                <button
                  type="button"
                  key={challenge.id}
                  onClick={() => setSelectedChallenge(challenge)}
                  className="w-full text-left rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white/80">
                          {challenge.title}
                        </h3>
                        <span className={`text-xs font-medium ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      {challenge.description && (
                        <p className="text-sm text-white/60 mt-1 line-clamp-1">
                          {challenge.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
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
      </div>

      <Dialog
        open={!!selectedChallenge}
        onOpenChange={(open) => !open && setSelectedChallenge(null)}
      >
        <DialogContent className="border-[#1f2128] bg-[#080a0f]">
          {selectedChallenge && selectedConfig && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle>{selectedChallenge.title}</DialogTitle>
                  <span className={`text-xs font-medium ${selectedConfig.color}`}>
                    {selectedConfig.label}
                  </span>
                </div>
                <DialogDescription>
                  {selectedChallenge.active
                    ? "Active challenge"
                    : "Inactive challenge"}
                </DialogDescription>
              </DialogHeader>
              {selectedChallenge.description && (
                <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                  <p className="text-white/80 whitespace-pre-wrap">
                    {selectedChallenge.description}
                  </p>
                </div>
              )}
              <div className="flex gap-3 justify-end">
                {isOwner && (
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(selectedChallenge.id)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete challenge"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setSelectedChallenge(null)}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {canUseDom && createDialog ? createPortal(createDialog, document.body) : null}
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
        className="fixed inset-0 z-[9998] bg-black/60"
        style={{
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          left: isLargeScreen ? "18rem" : 0,
        }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
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
                className="min-h-[80px] w-full rounded-md border border-[#1f2128] bg-[#0a0b0f] px-3 py-2 text-sm text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22D3EE]/70"
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

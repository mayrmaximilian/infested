"use client";


import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, AlertCircle, Megaphone, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PublishUpdateForm } from "./publish-update-form";
import { deleteGameUpdate } from "@/app/actions/updates";

type UpdateType = "patch" | "major" | "hotfix" | "announcement";

type Update = {
  id: string;
  title: string;
  description: string | null;
  update_type: UpdateType;
  version: string | null;
  released_at: string;
};

type GameUpdatesProps = {
  updates: Update[];
  isOwner: boolean;
  gameId?: string;
  onDeleteUpdate?: (updateId: string) => Promise<void> | void;
  showHeader?: boolean;
};

const updateTypeConfig = {
  patch: {
    icon: Zap,
    color: "text-blue-400",
    bg: "bg-blue-500/20",
    label: "Patch",
  },
  major: {
    icon: AlertCircle,
    color: "text-red-400",
    bg: "bg-red-500/20",
    label: "Major Update",
  },
  hotfix: {
    icon: Zap,
    color: "text-green-400",
    bg: "bg-green-500/20",
    label: "Hotfix",
  },
  announcement: {
    icon: Megaphone,
    color: "text-yellow-400",
    bg: "bg-yellow-500/20",
    label: "Announcement",
  },
} as const;

export function GameUpdates({
  updates,
  isOwner,
  onDeleteUpdate,
  gameId,
  showHeader = true,
}: GameUpdatesProps) {
  const router = useRouter();
  const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const updatesList = Array.isArray(updates) ? updates : [];
  const canCreate = Boolean(gameId) && isOwner;
  const portalRoot = typeof document === "undefined" ? null : document.body;

  const handleDelete = async (updateId: string) => {
    setIsDeleting(true);
    try {
      if (onDeleteUpdate) {
        await onDeleteUpdate(updateId);
      } else {
        const result = await deleteGameUpdate(updateId);
        if (result?.error) {
          alert(result.error);
          return;
        }
      }
      setSelectedUpdate(null);
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  const createDialog = showCreateDialog && canCreate && portalRoot
    ? createPortal(
        <CreateUpdateDialog
          gameId={gameId as string}
          onClose={() => setShowCreateDialog(false)}
          onSuccess={() => setShowCreateDialog(false)}
        />,
        portalRoot
      )
    : null;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-[#1f2128] bg-[#0b0d12] p-6">
        {showHeader && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Updates</h2>
          </div>
        )}
        {updatesList.length === 0 ? (
          <p className="text-white/60 text-center py-8">No updates yet</p>
        ) : (
          <div className="space-y-3">
            {updatesList.map((update) => {
              const config = updateTypeConfig[update.update_type];
              const Icon = config.icon;
              return (
                <button
                  key={update.id}
                  onClick={() => setSelectedUpdate(update)}
                  className="w-full text-left rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors p-4 cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`${config.bg} rounded-lg p-2 mt-0.5`}>
                        <Icon className={`${config.color} h-4 w-4`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold group-hover:text-white/80">
                            {update.title}
                          </h3>
                          {update.version && (
                            <span className="text-xs bg-white/10 px-2 py-1 rounded text-white/60">
                              v{update.version}
                            </span>
                          )}
                          <span className={`text-xs font-medium ${config.color}`}>
                            {config.label}
                          </span>
                        </div>
                        {update.description && (
                          <p className="text-sm text-white/60 mt-1 line-clamp-1">
                            {update.description}
                          </p>
                        )}
                        <p className="text-xs text-white/40 mt-2">
                          {formatDistanceToNow(new Date(update.released_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
        {canCreate && (
          <Button
            size="sm"
            variant="ghost"
            className="mt-2 gap-2"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4" />
            Add update
          </Button>
        )}
      </div>
      {createDialog}
      <Dialog
        open={!!selectedUpdate}
        onOpenChange={(open) => !open && setSelectedUpdate(null)}
      >
        <DialogContent className="border-[#1f2128] bg-[#080a0f]">
          {selectedUpdate && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div
                    className={`${
                      updateTypeConfig[selectedUpdate.update_type].bg
                    } rounded-lg p-2`}
                  >
                    {(() => {
                      const Icon =
                        updateTypeConfig[selectedUpdate.update_type].icon;
                      return (
                        <Icon
                          className={`${
                            updateTypeConfig[selectedUpdate.update_type].color
                          } h-5 w-5`}
                        />
                      );
                    })()}
                  </div>
                  <div>
                    <DialogTitle>{selectedUpdate.title}</DialogTitle>
                    <DialogDescription>
                      {selectedUpdate.version &&
                        `Version ${selectedUpdate.version} • `}
                      {formatDistanceToNow(
                        new Date(selectedUpdate.released_at),
                        { addSuffix: true }
                      )}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4">
                {selectedUpdate.description && (
                  <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                    <p className="text-white/80 whitespace-pre-wrap">
                      {selectedUpdate.description}
                    </p>
                  </div>
                )}
                <div className="flex gap-3 justify-end">
                  {isOwner && (
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(selectedUpdate.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete update"}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setSelectedUpdate(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateUpdateDialog({
  gameId,
  onClose,
  onSuccess,
}: {
  gameId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
      style={{ left: 0 }}
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full max-w-md rounded-lg border border-[#1f2128] bg-[#0b0d12] p-6 shadow-lg mx-4 pointer-events-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Publish Update</h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <Plus className="h-4 w-4 rotate-45" />
          </Button>
        </div>
        <PublishUpdateForm gameId={gameId} onSuccess={onSuccess} />
      </div>
    </div>
  );
}

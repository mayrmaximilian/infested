"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteGamePageAction } from "@/app/actions/games";

interface DeleteGameButtonProps {
  gameId: string;
  gameTitle: string;
}

export function DeleteGameButton({ gameId, gameTitle }: DeleteGameButtonProps) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    const formData = new FormData();
    formData.append("id", gameId);
    const result = await deleteGamePageAction(formData);

    if (result.error) {
      setError(result.error);
      setIsDeleting(false);
    } else {
      setShowDialog(false);
      router.refresh();
    }
  };

  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsLargeScreen(window.innerWidth >= 1024);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const dialog = showDialog ? (
    <>
      <div
        className="fixed inset-0 z-[9998] bg-black/60"
        style={{
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          left: isLargeScreen ? "18rem" : 0,
        }}
        onClick={() => !isDeleting && setShowDialog(false)}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
        style={{ left: isLargeScreen ? "18rem" : 0 }}
      >
        <div className="relative w-full max-w-lg rounded-lg border border-[#1f2128] bg-[#0b0d12] p-6 shadow-lg mx-4 pointer-events-auto">
          <h2 className="text-lg font-semibold text-white">Delete game?</h2>
          <p className="mt-2 text-sm text-white/70">
            Are you sure you want to delete{" "}
            <span className="font-medium text-white">{gameTitle}</span>? This
            action cannot be undone.
          </p>
          {error && (
            <div className="mt-4 rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </div>
    </>
  ) : null;

  return (
    <>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => setShowDialog(true)}
      >
        Delete
      </Button>

      {mounted && dialog && createPortal(dialog, document.body)}
    </>
  );
}

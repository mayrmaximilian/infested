"use client";

import { useState } from "react";
import { GameUpdates } from "./game-updates";
import { PublishUpdateForm } from "./publish-update-form";

type Update = {
  id: string;
  title: string;
  description: string | null;
  update_type: "patch" | "major" | "hotfix" | "announcement";
  version: string | null;
  released_at: string;
};

interface UpdatesSectionProps {
  gameId: string;
  updates: Update[];
  isOwner: boolean;
}

export function UpdatesSection({
  gameId,
  updates,
  isOwner,
}: UpdatesSectionProps) {
  const updatesList = Array.isArray(updates) ? updates : [];

  return (
    <GameUpdates updates={updatesList} isOwner={isOwner} gameId={gameId} />
  );
}

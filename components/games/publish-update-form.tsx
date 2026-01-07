"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { publishGameUpdate } from "@/app/actions/updates";

interface PublishUpdateFormProps {
  gameId: string;
  onSuccess?: () => void;
}

type UpdateType = "patch" | "major" | "hotfix" | "announcement";

export function PublishUpdateForm({
  gameId,
  onSuccess,
}: PublishUpdateFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const updateType = formData.get("updateType") as UpdateType;
    const version = formData.get("version") as string;

    try {
      const result = await publishGameUpdate(
        gameId,
        title,
        description,
        updateType,
        version || undefined
      );

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        form.reset();
        if (onSuccess) onSuccess();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish update");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-500/20 border border-green-500/50 p-3">
          <p className="text-sm text-green-400">
            Update published successfully!
          </p>
        </div>
      )}

      <div>
        <Label htmlFor="title">Update Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g., Fixed bug with controller input"
          required
          disabled={isLoading}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="updateType">Update Type</Label>
        <select
          id="updateType"
          name="updateType"
          defaultValue="patch"
          disabled={isLoading}
          className="mt-1 w-full rounded-lg border border-[#1f2128] bg-[#0b0d12] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#D946EF]"
        >
          <option value="patch">Patch</option>
          <option value="major">Major Update</option>
          <option value="hotfix">Hotfix</option>
          <option value="announcement">Announcement</option>
        </select>
      </div>

      <div>
        <Label htmlFor="version">Version (optional)</Label>
        <Input
          id="version"
          name="version"
          placeholder="e.g., 1.2.0"
          disabled={isLoading}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          placeholder="Describe the update details..."
          required
          disabled={isLoading}
          rows={5}
          className="mt-1 w-full rounded-lg border border-[#1f2128] bg-[#0b0d12] px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#D946EF]"
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Publishing..." : "Publish Update"}
      </Button>
    </form>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { updateGamePageAction, deleteGamePageAction } from "@/app/actions/games";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ActionState =
  | { success: string; id?: string; error?: undefined }
  | { error: string; success?: undefined; id?: undefined }
  | undefined;

type Props = {
  id: string;
  title: string;
  summary: string;
  heroUrl: string;
  genre: string;
};

export function GameEditForm({ id, title, summary, heroUrl, genre }: Props) {
  const [state, formAction] = React.useActionState<ActionState, FormData>(
    updateGamePageAction,
    undefined
  );

  const deleteHandler = React.useCallback(async (formData: FormData) => {
    await deleteGamePageAction(formData);
  }, []);

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="id" value={id} />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Game title</Label>
            <Input id="title" name="title" required maxLength={100} defaultValue={title} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="genre">Genre</Label>
            <select
              id="genre"
              name="genre"
              defaultValue={genre || "other"}
              className="h-11 w-full rounded-md border border-[#1f2128] bg-[#0a0b0f] px-3 text-sm text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22D3EE]/70"
            >
              <option value="action">Action</option>
              <option value="adventure">Adventure</option>
              <option value="rpg">RPG</option>
              <option value="strategy">Strategy</option>
              <option value="simulation">Simulation</option>
              <option value="platformer">Platformer</option>
              <option value="roguelite">Rogue-lite</option>
              <option value="puzzle">Puzzle</option>
              <option value="horror">Horror</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="heroUrl">Hero image URL</Label>
            <Input
              id="heroUrl"
              name="heroUrl"
              type="url"
              required
              defaultValue={heroUrl}
              placeholder="https://your-cdn.com/hero.jpg"
            />
            <p className="text-xs text-white/50">
              Wide 16:9 works best (e.g. 1920x1080). Public URL required.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="summary">Summary</Label>
          <textarea
            id="summary"
            name="summary"
            required
            maxLength={400}
            defaultValue={summary}
            className="min-h-[140px] w-full rounded-md border border-[#1f2128] bg-[#0a0b0f] px-3 py-2 text-sm text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22D3EE]/70"
          />
        </div>

        {state?.error ? (
          <div className="rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {state.error}
          </div>
        ) : null}
        {state?.success ? (
          <div className="flex flex-wrap items-center gap-3 rounded-md border border-[#22D3EE]/40 bg-[#22D3EE]/10 px-3 py-2 text-sm text-[#a5f3fc]">
            <span>{state.success}</span>
            {state.id ? (
              <Link
                className="underline underline-offset-4"
                href={`/games/${state.id}`}
                target="_blank"
              >
                View public page
              </Link>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" className="gap-2">
            Save changes
          </Button>
          <Button asChild variant="ghost">
            <Link href="/app/games">Back to list</Link>
          </Button>
        </div>
      </form>

      <form action={deleteHandler} className="inline">
        <input type="hidden" name="id" value={id} />
        <Button variant="destructive" size="sm">
          Delete
        </Button>
      </form>
    </div>
  );
}

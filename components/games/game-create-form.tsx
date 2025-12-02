"use client";

import React from "react";
import Link from "next/link";
import { createGamePageAction } from "@/app/actions/games";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ActionState =
  | { success: string; id?: string; error?: undefined }
  | { error: string; success?: undefined; id?: undefined }
  | undefined;

export function GameCreateForm() {
  const [state, formAction] = React.useActionState<ActionState, FormData>(
    createGamePageAction,
    undefined
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Game title</Label>
          <Input id="title" name="title" required maxLength={100} placeholder="Echoes of Glass" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="genre">Genre</Label>
          <select
            id="genre"
            name="genre"
            defaultValue="action"
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
            placeholder="https://your-cdn.com/hero.jpg"
          />
          <p className="text-xs text-white/50">
            Wide 16:9 works best (e.g. 1920x1080). Public URL required.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="summary">Summary</Label>
          <textarea
            id="summary"
            name="summary"
            required
            maxLength={400}
            placeholder="Describe the vibe, hook, and what makes it special."
            className="min-h-[140px] w-full rounded-md border border-[#1f2128] bg-[#0a0b0f] px-3 py-2 text-sm text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22D3EE]/70"
          />
        </div>
        <div className="space-y-2">
          <Label>Extras (optional)</Label>
          <div className="rounded-md border border-[#1f2128] bg-[#0a0b0f] p-3 text-sm text-white/80">
            <p className="text-xs uppercase tracking-[0.18em] text-white/50">Ideas</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-white/70">
              <li>Add trailer URL, Discord link, or Steam page once ready.</li>
              <li>Drop key features: co-op, rogue-lite, story-driven, etc.</li>
              <li>Share current phase: alpha, beta, playtest, or wishlist.</li>
            </ul>
          </div>
        </div>
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
          Publish landing
        </Button>
        <Button asChild variant="ghost">
          <Link href="/app">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}

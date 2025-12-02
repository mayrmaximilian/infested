"use client";

import React from "react";
import Link from "next/link";
import { signUpAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState = undefined;

export function SignupForm() {
  const [state, formAction] = React.useActionState(signUpAction, initialState);

  return (
    <Card className="w-full max-w-md border-[#1f2128] bg-[#080a0f]/80 backdrop-blur">
      <CardHeader className="space-y-2">
        <CardTitle>Join infested</CardTitle>
        <CardDescription>
          Build your indie library, follow drops, and support creators.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="nickname"
              placeholder="GhostCrawler"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@infested.gg"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Account type</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-md border border-[#1f2128] bg-[#0a0b0f] px-3 py-2 text-sm text-white/80">
                <input
                  type="radio"
                  name="role"
                  value="gamer"
                  defaultChecked
                  className="h-4 w-4 accent-[#D946EF]"
                />
                <div>
                  <p className="font-medium text-white">Gamer</p>
                  <p className="text-xs text-white/60">Play, follow drops, and build your library.</p>
                </div>
              </label>
              <label className="flex items-center gap-3 rounded-md border border-[#1f2128] bg-[#0a0b0f] px-3 py-2 text-sm text-white/80">
                <input
                  type="radio"
                  name="role"
                  value="developer"
                  className="h-4 w-4 accent-[#D946EF]"
                />
                <div>
                  <p className="font-medium text-white">Developer</p>
                  <p className="text-xs text-white/60">Publish builds, manage playtests, reach players.</p>
                </div>
              </label>
            </div>
            <p className="text-xs text-white/50">
              You can change this anytime in profile settings.
            </p>
          </div>

          {state?.error ? (
            <p className="rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {state.error}
            </p>
          ) : null}
          {state?.success ? (
            <p className="rounded-md border border-[#22D3EE]/40 bg-[#22D3EE]/10 px-3 py-2 text-sm text-[#a5f3fc]">
              {state.success}
            </p>
          ) : null}

          <Button type="submit" className="w-full">
            Create account
          </Button>
        </form>

        <p className="text-sm text-white/60">
          Already in?{" "}
          <Link className="text-[#22D3EE] underline underline-offset-4" href="/auth/login">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

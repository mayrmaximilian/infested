"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { signInAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState = undefined;

export function LoginForm() {
  const [state, formAction] = useFormState(signInAction, initialState);

  return (
    <Card className="w-full max-w-md border-[#1f2128] bg-[#080a0f]/80 backdrop-blur">
      <CardHeader className="space-y-2">
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to access the infested hub.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form action={formAction} className="space-y-4">
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
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
          </div>

          {state?.error ? (
            <p className="rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {state.error}
            </p>
          ) : null}

          <Button type="submit" className="w-full">
            Enter infested
          </Button>
        </form>

        <p className="text-sm text-white/60">
          New here?{" "}
          <Link className="text-[#22D3EE] underline underline-offset-4" href="/auth/signup">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

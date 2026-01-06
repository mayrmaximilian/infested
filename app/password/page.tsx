"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/logo";

export default function PasswordPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const correctPassword =
      process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "infested2026";

    if (password === correctPassword) {
      // Set cookie
      document.cookie = `app_password=${password}; path=/; max-age=604800`; // 7 days
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 100);
      return;
    } else {
      setError("Incorrect password. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,#D946EF30,transparent_35%),radial-gradient(circle_at_85%_0%,#22D3EE24,transparent_35%),radial-gradient(circle_at_50%_80%,#2DD4BF22,transparent_35%)]" />
      <div className="absolute inset-x-6 top-12 -z-10 h-80 rounded-full bg-[#D946EF]/10 blur-[140px]" />

      <Card className="w-full max-w-md border-[#1f2128] bg-[#080a0f]/80 backdrop-blur">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <Logo className="h-10" />
          </div>
          <CardTitle>University Project</CardTitle>
          <CardDescription>
            This is a protected university project. Please enter the password to
            continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
            </div>

            {error && (
              <p className="rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-[#D946EF] text-white hover:bg-[#f160ff]"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Enter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

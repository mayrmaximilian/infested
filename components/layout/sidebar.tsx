 "use client";

import Link from "next/link";
import NextImage from "next/image";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { signOutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import { NavLinks } from "@/components/navigation/nav-links";
import { Rocket, LayoutDashboard } from "lucide-react";

type Props = {
  userEmail?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  role?: string | null;
};

export function Sidebar({ userEmail, displayName, avatarUrl, role }: Props) {
  const name = displayName || userEmail || "Player";
  const normalizedAvatar =
    avatarUrl?.replace(/\/avatars\/(?:avatars\/)+/, "/avatars/") ?? avatarUrl ?? null;
  const pathname = usePathname();
  const isSettings = pathname.startsWith("/app/settings");
  return (
    <aside className="flex h-full w-72 flex-col gap-6 border-r border-[#1a1420] bg-[radial-gradient(circle_at_15%_20%,#22D3EE1f,transparent_40%),radial-gradient(circle_at_80%_0%,#D946EF12,transparent_45%),#06060b]/90 px-6 py-6 backdrop-blur-2xl">
      <div className="flex items-center justify-between">
        <Logo />
        <span className="rounded-full bg-[#0f1117] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/60">
          beta
        </span>
      </div>

      <Separator />

      <div className="flex-1 overflow-y-auto pr-1">
        <NavLinks role={role} />
        {role === "developer" ? (
          <div className="mt-6 space-y-2 rounded-lg border border-[#1f2128] bg-white/5 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Developer</p>
            <Button asChild variant="secondary" className="w-full gap-2">
              <Link href="/app/games/new">
                <Rocket className="h-4 w-4" />
                Create game page
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full justify-start gap-2">
              <Link href="/app/games">
                <LayoutDashboard className="h-4 w-4" />
                My games
              </Link>
            </Button>
          </div>
        ) : null}
      </div>

      <Separator />

      <div className="space-y-3">
        <Link
          href="/app/settings"
          className={cn(
            "flex items-center gap-3 rounded-md px-2 py-1 -mx-2 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22D3EE]/70",
            isSettings && "bg-white/5"
          )}
          aria-label="Open settings"
        >
          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-[#1f2128] bg-white/5">
            {normalizedAvatar ? (
              <NextImage
                src={normalizedAvatar}
                alt={`${name} avatar`}
                width={40}
                height={40}
                className="h-full w-full rounded-full object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#0a0b0f] text-sm font-semibold text-white/70">
                {name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
              signed in
            </p>
            <p className="text-sm font-medium text-white">{name}</p>
            {userEmail ? (
              <p className="text-xs text-white/50 break-all">{userEmail}</p>
            ) : null}
          </div>
        </Link>
        <form action={signOutAction}>
          <Button variant="outline" className="w-full">
            Sign out
          </Button>
        </form>
      </div>
    </aside>
  );
}

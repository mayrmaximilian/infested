import NextImage from "next/image";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { signOutAction } from "@/app/actions/auth";
import { NavLinks } from "@/components/navigation/nav-links";

type Props = {
  userEmail?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
};

export function Sidebar({ userEmail, displayName, avatarUrl }: Props) {
  const name = displayName || userEmail || "Player";
  const normalizedAvatar =
    avatarUrl?.replace(/\/avatars\/(?:avatars\/)+/, "/avatars/") ?? avatarUrl ?? null;
  return (
    <aside className="flex h-full w-72 flex-col gap-6 border-r border-[#12131a] bg-[#05060a]/80 px-6 py-6 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <Logo />
        <span className="rounded-full bg-[#0f1117] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/60">
          beta
        </span>
      </div>

      <Separator />

      <div className="flex-1 overflow-y-auto pr-1">
        <NavLinks />
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center gap-3">
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
        </div>
        <form action={signOutAction}>
          <Button variant="outline" className="w-full">
            Sign out
          </Button>
        </form>
      </div>
    </aside>
  );
}

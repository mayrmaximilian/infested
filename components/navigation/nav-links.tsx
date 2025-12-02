"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gamepad2,
  LayoutDashboard,
  PanelsTopLeft,
  Radar,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";

type LinkItem = {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  role?: "developer";
};

const links: LinkItem[] = [
  { href: "/app", label: "Overview", icon: LayoutDashboard },
  { href: "/app/library", label: "Library", icon: Gamepad2 },
  { href: "/app/discover", label: "Discover", icon: Radar },
  { href: "/app/creators", label: "Creators", icon: PanelsTopLeft },
];

const devLinks: LinkItem[] = [
  { href: "/app/games", label: "My games", icon: Rocket, role: "developer" },
];

export function NavLinks({ role }: { role?: string | null }) {
  const pathname = usePathname();
  const isActive = (href: string) => {
    if (href === "/app") {
      return pathname === "/app";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="space-y-1.5">
      {links.map((link) => {
        if (link.role && link.role !== role) return null;
        const Icon = link.icon;
        const active = isActive(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
              "hover:bg-white/5",
              active
                ? "bg-gradient-to-r from-[#122134] via-[#1a1f2c] to-transparent text-[#22D3EE] shadow-sm shadow-[#22D3EE]/25 border border-[#1f2a32]"
                : "text-white border border-transparent"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{link.label}</span>
          </Link>
        );
      })}
      {role === "developer" && (
        <div className="mt-4 space-y-1.5">
          <p className="px-3 text-xs uppercase tracking-[0.2em] text-white/50">
            Developer
          </p>
          {devLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                  "hover:bg-white/5",
                  active
                    ? "bg-gradient-to-r from-[#122134] via-[#1a1f2c] to-transparent text-[#22D3EE] shadow-sm shadow-[#22D3EE]/25 border border-[#1f2a32]"
                    : "text-white border border-transparent"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}

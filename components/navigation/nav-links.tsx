"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gamepad2,
  LayoutDashboard,
  PanelsTopLeft,
  Radar,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/app", label: "Overview", icon: LayoutDashboard },
  { href: "/app/library", label: "Library", icon: Gamepad2 },
  { href: "/app/discover", label: "Discover", icon: Radar },
  { href: "/app/creators", label: "Creators", icon: PanelsTopLeft },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1.5">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive =
          pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
              "hover:bg-white/5",
              isActive
                ? "bg-white/10 text-white shadow-sm shadow-[#D946EF]/30"
                : "text-white/60"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

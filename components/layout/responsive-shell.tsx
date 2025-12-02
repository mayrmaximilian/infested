"use client";

import React from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
};

export function ResponsiveShell({ sidebar, children }: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_20%_10%,#D946EF15,transparent_30%),radial-gradient(circle_at_80%_0%,#22D3EE1a,transparent_20%),linear-gradient(160deg,#05060a,#050507)] text-white lg:pl-72">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 lg:hidden">
        <Logo />
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-72 transform bg-[#05060a] shadow-2xl shadow-black/40 transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebar}
      </div>
      {open ? (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <main className="px-4 py-6 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-6xl space-y-8">{children}</div>
      </main>
    </div>
  );
}

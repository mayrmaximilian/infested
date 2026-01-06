"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Suggestion = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string | null;
  relationship_status: "pending" | "accepted" | "blocked" | null;
};

type SocialSearchProps = {
  initialQuery?: string;
  variant?: "panel" | "header";
};

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function SocialSearch({
  initialQuery = "",
  variant = "panel",
}: SocialSearchProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [requestState, setRequestState] = useState<Record<string, string>>({});
  const isHeader = variant === "header";

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (containerRef.current.contains(event.target as Node)) return;
      setIsOpen(false);
      setIsLoading(false);
      setSuggestions([]);
      setQuery((prev) => (prev ? "" : prev));
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    let isCanceled = false;
    setIsLoading(true);
    const handle = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/social/search?q=${encodeURIComponent(trimmed)}`
        );
        if (isCanceled) return;
        if (!res.ok) {
          setSuggestions([]);
          setIsOpen(false);
          setIsLoading(false);
          return;
        }
        const data = (await res.json()) as { results: Suggestion[] };
        if (isCanceled) return;
        setSuggestions(data.results ?? []);
        setIsOpen(true);
      } catch {
        if (isCanceled) return;
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        if (!isCanceled) setIsLoading(false);
      }
    }, 250);

    return () => {
      isCanceled = true;
      window.clearTimeout(handle);
    };
  }, [query]);

  const scrollToResults = () => {
    window.setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setIsOpen(false);
    router.push(`/app/social?q=${encodeURIComponent(trimmed)}#results`);
    scrollToResults();
  };

  const handlePick = (name: string) => {
    setQuery(name);
    setIsOpen(false);
    router.push(`/app/social?q=${encodeURIComponent(name)}#results`);
    scrollToResults();
  };

  const handleRequest = async (targetId: string) => {
    setRequestState((prev) => ({ ...prev, [targetId]: "loading" }));
    try {
      const res = await fetch("/api/social/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId }),
      });
      if (res.ok) {
        setRequestState((prev) => ({ ...prev, [targetId]: "sent" }));
        return;
      }
      const data = (await res.json()) as { error?: string };
      if (res.status === 409) {
        setRequestState((prev) => ({ ...prev, [targetId]: "pending" }));
      } else {
        setRequestState((prev) => ({
          ...prev,
          [targetId]: data.error ?? "error",
        }));
      }
    } catch {
      setRequestState((prev) => ({ ...prev, [targetId]: "error" }));
    }
  };

  return (
    <div
      ref={containerRef}
      className={
        isHeader
          ? "w-full rounded-2xl border border-white/10 bg-white/5 p-3"
          : "rounded-2xl border border-[#1f2128] bg-[#0b0d12] p-6"
      }
    >
      <form
        className={isHeader ? "flex flex-col gap-2 sm:flex-row" : "flex flex-col gap-3 sm:flex-row"}
        onSubmit={onSubmit}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by display name"
            className="pl-9"
            onFocus={() => {
              if (suggestions.length > 0) setIsOpen(true);
            }}
          />
          {isOpen && (
            <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-xl border border-[#1f2128] bg-[#0b0d12] shadow-xl">
              {isLoading ? (
                <div className="px-4 py-3 text-xs text-white/50">
                  Searching...
                </div>
              ) : suggestions.length === 0 ? (
                <div className="px-4 py-3 text-xs text-white/50">
                  No matches yet.
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {suggestions.map((profile) => {
                    const name = profile.display_name || "Player";
                    const status =
                      requestState[profile.id] ?? profile.relationship_status;
                    const isLoading = status === "loading";
                    const isPending = status === "pending" || status === "sent";
                    const isFriend = status === "accepted";
                    const isBlocked = status === "blocked";
                    const canRequest =
                      !isLoading && !isPending && !isFriend && !isBlocked;
                    const label = isFriend
                      ? "Friend"
                      : isPending
                        ? "Pending"
                        : isBlocked
                          ? "Blocked"
                          : isLoading
                            ? "..."
                            : "Add";
                    const buttonClass = isFriend
                      ? "border-emerald-500/40 text-emerald-400"
                      : isPending
                        ? "border-emerald-500/40 text-emerald-400"
                        : isBlocked
                          ? "border-red-500/40 text-red-400"
                          : "border-white/10 text-white/60 hover:border-white/30";

                    return (
                      <div
                        key={profile.id}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-white/5"
                      >
                        <button
                          type="button"
                          onClick={() => handlePick(name)}
                          className="flex flex-1 items-center gap-3 text-left"
                        >
                          <div className="h-9 w-9 overflow-hidden rounded-full border border-[#1f2128] bg-[#0a0b0f]">
                            {profile.avatar_url ? (
                              <img
                                src={profile.avatar_url}
                                alt={name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-white/70">
                                {initialsFor(name)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-white">
                              {name}
                            </p>
                            <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">
                              {profile.role ?? "gamer"}
                            </p>
                          </div>
                        </button>
                        {canRequest ? (
                          <button
                            type="button"
                            onClick={() => handleRequest(profile.id)}
                            disabled={isLoading}
                            className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] uppercase tracking-[0.2em] transition ${buttonClass}`}
                          >
                            <UserPlus className="h-3 w-3" />
                            {label}
                          </button>
                        ) : (
                          <span
                            className={`rounded-md border px-2 py-1 text-[11px] uppercase tracking-[0.2em] ${buttonClass}`}
                          >
                            {label}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        <Button
          type="submit"
          size={isHeader ? "sm" : "md"}
          className={isHeader ? "h-11" : "gap-2"}
        >
          Search
        </Button>
      </form>
      {!isHeader ? (
        <p className="mt-2 text-xs text-white/40">
          Suggestions appear after two characters.
        </p>
      ) : null}
    </div>
  );
}

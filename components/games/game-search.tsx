"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type GameSuggestion = {
  id: string;
  title: string;
  cover_url: string | null;
  genre: string | null;
};

export function GameSearch() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GameSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (containerRef.current.contains(event.target as Node)) return;
      setIsOpen(false);
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
          `/api/games/search?q=${encodeURIComponent(trimmed)}`
        );
        if (isCanceled) return;
        if (!res.ok) {
          setSuggestions([]);
          setIsOpen(false);
          setIsLoading(false);
          return;
        }
        const data = (await res.json()) as { results: GameSuggestion[] };
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

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim()) return;
    setIsOpen(true);
  };

  const handlePick = (gameId: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/app/games/${gameId}`);
  };

  return (
    <div
      ref={containerRef}
      className="rounded-2xl border border-white/10 bg-white/5 p-3"
    >
      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={onSubmit}>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search games by title"
            className="pl-9"
            onFocus={() => {
              if (suggestions.length > 0) setIsOpen(true);
            }}
          />
          {isOpen ? (
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
                  {suggestions.map((game) => (
                    <button
                      key={game.id}
                      type="button"
                      onClick={() => handlePick(game.id)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/5"
                    >
                      <div className="h-12 w-10 overflow-hidden rounded-md border border-[#1f2128] bg-[#0a0b0f]">
                        {game.cover_url ? (
                          <img
                            src={game.cover_url}
                            alt={game.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.2em] text-white/40">
                            Game
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">
                          {game.title}
                        </p>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">
                          {game.genre ?? "indie"}
                        </p>
                      </div>
                      <span className="text-xs text-white/40">Open</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
        <Button type="submit" size="sm" className="h-11">
          Search
        </Button>
      </form>
    </div>
  );
}

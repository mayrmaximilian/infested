"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Game = {
  id: string;
  title: string;
  cover_url: string | null;
  genre: string | null;
};

interface GameSliderProps {
  games: Game[];
  emptyMessage?: string;
}

export function GameSlider({
  games,
  emptyMessage = "No games yet",
}: GameSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (games.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-lg border border-[#1f2128] bg-white/5">
        <p className="text-sm text-white/50">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="group relative">
      {/* Left scroll button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute left-0 top-1/2 z-10 -translate-y-1/2 bg-black/80 opacity-0 transition-opacity hover:bg-black group-hover:opacity-100"
        onClick={() => scroll("left")}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {games.map((game) => (
          <Link
            key={game.id}
            href={`/app/games/${game.id}`}
            className="group/card flex-shrink-0 transition-transform hover:scale-105"
          >
            <div
              className="relative overflow-hidden rounded-lg border border-[#1f2128] bg-black/50 shadow-lg"
              style={{ width: "250px", height: "312px" }}
            >
              {game.cover_url ? (
                <img
                  src={game.cover_url}
                  alt={game.title}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a0f1c] to-[#0b0d12]">
                  <span className="text-4xl">🎮</span>
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 opacity-0 transition-opacity group-hover/card:opacity-100">
                <p className="truncate text-sm font-medium text-white">
                  {game.title}
                </p>
                {game.genre && (
                  <p className="text-xs capitalize text-white/60">
                    {game.genre}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Right scroll button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-0 top-1/2 z-10 -translate-y-1/2 bg-black/80 opacity-0 transition-opacity hover:bg-black group-hover:opacity-100"
        onClick={() => scroll("right")}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}

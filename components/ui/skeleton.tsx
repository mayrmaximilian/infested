"use client";

import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-white/10",
        "before:block before:h-full before:w-full before:animate-[pulse_2s_ease-in-out_infinite] before:rounded-md before:bg-gradient-to-r before:from-white/5 before:via-white/15 before:to-white/5",
        className
      )}
    />
  );
}

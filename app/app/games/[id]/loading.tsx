import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function GameLoading() {
  return (
    <div className="space-y-6">
      {/* Hero section skeleton */}
      <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-[#2c1d35] bg-[#08080f] shadow-[0_30px_90px_-60px_#000]">
        {/* Background gradient placeholder */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#D946EF33,transparent_35%),radial-gradient(circle_at_80%_0%,#22D3EE33,transparent_35%),linear-gradient(135deg,#0a0a12,#05060a)] animate-pulse" />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />

        {/* Content skeleton */}
        <div className="relative z-10 flex min-h-[320px] flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
          {/* Cover image skeleton (4:5 aspect ratio) */}
          <Skeleton className="h-[150px] w-[120px] flex-shrink-0 rounded-lg bg-white/10" />

          {/* Title and info skeleton */}
          <div className="flex-1 space-y-4">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-6 w-28 rounded-full bg-white/10" />
              <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
              <Skeleton className="h-6 w-24 rounded-full bg-white/10" />
            </div>

            {/* Title and summary */}
            <div className="space-y-2">
              <Skeleton className="h-10 w-64 bg-white/10" />
              <Skeleton className="h-4 w-full max-w-xl bg-white/10" />
              <Skeleton className="h-4 w-3/4 max-w-md bg-white/10" />
            </div>

            {/* Feature chips */}
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  className="h-7 w-24 rounded-full bg-white/10"
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Skeleton className="h-10 w-24 rounded-md bg-white/10" />
              <Skeleton className="h-10 w-28 rounded-md bg-white/10" />
            </div>
          </div>
        </div>
      </div>

      {/* First row of cards - Leaderboard & Challenges */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-[#1f2128] bg-gradient-to-br from-[#0b0d12] via-[#0f0f18] to-[#1a0f1c]">
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-6 w-28 bg-white/10" />
            <Skeleton className="h-6 w-24 rounded-full bg-white/10" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-md border border-[#1f2128] bg-white/5 px-3 py-2"
              >
                <Skeleton className="h-4 w-6 bg-white/10" />
                <Skeleton className="h-4 w-32 bg-white/10" />
                <Skeleton className="h-4 w-10 bg-white/10" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-[#1f2128] bg-gradient-to-br from-[#0b0d12] via-[#0f0f18] to-[#111121]">
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-6 w-24 bg-white/10" />
            <Skeleton className="h-6 w-16 rounded-full bg-white/10" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-md border border-[#1f2128] bg-white/5 px-3 py-2"
              >
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-40 bg-white/10" />
                  <Skeleton className="h-3 w-24 bg-white/10" />
                </div>
                <Skeleton className="h-5 w-14 rounded-full bg-white/10" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Second row of cards - Socials & Updates */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-[#1f2128] bg-gradient-to-br from-[#0b0d12] via-[#0f0f18] to-[#0e131f]">
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-6 w-32 bg-white/10" />
            <Skeleton className="h-6 w-24 rounded-full bg-white/10" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-md border border-[#1f2128] bg-white/5 px-3 py-2"
              >
                <div className="space-y-1">
                  <Skeleton className="h-4 w-28 bg-white/10" />
                  <Skeleton className="h-3 w-44 bg-white/10" />
                </div>
                <Skeleton className="h-8 w-14 rounded-md bg-white/10" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-[#1f2128] bg-gradient-to-br from-[#0b0d12] via-[#0f0f18] to-[#0f1424]">
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-6 w-20 bg-white/10" />
            <Skeleton className="h-6 w-12 rounded-full bg-[#D946EF]/10" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-md border border-[#1f2128] bg-white/5 px-3 py-2"
              >
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24 bg-white/10" />
                  <Skeleton className="h-3 w-48 bg-white/10" />
                </div>
                <Skeleton className="h-8 w-14 rounded-md bg-white/10" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Pitch It skeleton */}
      <Card className="border-[#1f2128] bg-gradient-to-br from-[#0b0d12] via-[#0f0f18] to-[#1a1025]">
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-6 w-24 bg-white/10" />
          <Skeleton className="h-6 w-28 rounded-full bg-[#D946EF]/20" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-md border border-[#1f2128] bg-white/5 px-3 py-3"
            >
              <Skeleton className="h-8 w-8 rounded-full bg-white/10" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-40 bg-white/10" />
                <Skeleton className="h-3 w-56 bg-white/10" />
              </div>
              <Skeleton className="h-4 w-6 bg-white/10" />
              <Skeleton className="h-8 w-16 rounded-md bg-white/10" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

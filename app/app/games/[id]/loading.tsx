import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function GameLoading() {
  return (
    <div className="space-y-6">
      {/* Hero section skeleton */}
      <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-[#2c1d35] bg-[#08080f] shadow-[0_30px_90px_-60px_#000]">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
        <div className="relative z-10 flex min-h-[320px] flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
          <Skeleton className="h-[150px] w-[120px] flex-shrink-0 rounded-lg" />
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-6 w-24 rounded-full" />
              ))}
            </div>
            <div className="space-y-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-4 w-full max-w-xl" />
              <Skeleton className="h-4 w-3/4 max-w-md" />
            </div>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-7 w-24 rounded-full" />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-10 w-28 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="border-[#1f2128] bg-[#0b0d12]">
            <CardHeader className="flex flex-row items-center justify-between">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div
                  key={j}
                  className="flex items-center justify-between rounded-md border border-[#1f2128] bg-white/5 px-3 py-2"
                >
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Cards */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-[#1f2128] bg-[#0b0d12] p-6 space-y-3"
        >
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

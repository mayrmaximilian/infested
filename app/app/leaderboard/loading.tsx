import { Skeleton } from "@/components/ui/skeleton";

export default function LeaderboardLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-1">
        <Skeleton className="h-4 w-32 mb-4" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-52" />
          </div>
        </div>
        <Skeleton className="h-4 w-96 mt-2" />
      </header>

      {/* How to earn XP */}
      <div className="rounded-2xl border border-[#1f2128] bg-gradient-to-br from-[#0b0d12] via-[#0f0f18] to-[#0b0d12] p-6">
        <Skeleton className="h-6 w-36 mb-4" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>

      {/* User rank card */}
      <Skeleton className="h-32 rounded-xl" />

      {/* Main leaderboard */}
      <div className="rounded-2xl border border-[#1f2128] bg-[#0b0d12] p-6 space-y-4">
        {/* Filter tabs */}
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-28 rounded-lg" />
          ))}
        </div>

        {/* Leaderboard entries */}
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

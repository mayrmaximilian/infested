import { Skeleton } from "@/components/ui/skeleton";

export default function ChallengesLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <header className="space-y-1">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-48" />
          </div>
        </div>
        <Skeleton className="h-5 w-96 mt-2" />
      </header>

      {/* Prize Banner */}
      <Skeleton className="h-24 rounded-2xl" />

      {/* Challenge Types */}
      <div className="rounded-2xl border border-[#1f2128] bg-[#0b0d12] p-6">
        <Skeleton className="h-6 w-36 mb-4" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Active Challenges */}
      <div>
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#1f2128] bg-[#0b0d12] overflow-hidden"
            >
              <div className="px-6 py-3 border-b border-[#1f2128]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <div>
                      <Skeleton className="h-3 w-16 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <Skeleton className="h-14 w-14 rounded-xl flex-shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
                <Skeleton className="h-14 rounded-xl mb-6" />
                <Skeleton className="h-32 rounded-xl mb-6" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <Skeleton className="h-10 w-32 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

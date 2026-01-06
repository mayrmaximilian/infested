import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="rounded-2xl border border-[#1f2128] bg-gradient-to-br from-[#0b0d12] via-[#0f0f18] to-[#1a0f1c] p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-14 w-24 rounded-xl" />
            <Skeleton className="h-14 w-24 rounded-xl" />
            <Skeleton className="h-14 w-24 rounded-xl" />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        {/* Left Column - Games */}
        <div className="space-y-8 min-w-0">
          {[1, 2, 3].map((i) => (
            <section key={i} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <Skeleton className="h-5 w-28" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
              <div className="flex gap-4 overflow-hidden">
                {[1, 2, 3, 4, 5].map((j) => (
                  <Skeleton
                    key={j}
                    className="flex-shrink-0 rounded-lg"
                    style={{ width: "140px", height: "175px" }}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Right Column - Leaderboard & Tournaments */}
        <aside className="space-y-6">
          {/* Leaderboard */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-5 w-28" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="rounded-xl border border-[#1f2128] bg-[#0b0d12] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#1f2128]">
                <Skeleton className="h-3 w-28" />
              </div>
              <div className="divide-y divide-[#1f2128]/50">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <Skeleton className="h-6 w-6 rounded" />
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-5 w-12" />
                  </div>
                ))}
              </div>
              <div className="border-t border-[#1f2128] py-3 px-4">
                <Skeleton className="h-3 w-28 mx-auto" />
              </div>
            </div>
          </div>

          {/* Tournaments */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-5 w-36" />
            </div>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

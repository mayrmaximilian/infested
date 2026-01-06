import { Skeleton } from "@/components/ui/skeleton";

export default function GameLoading() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero skeleton */}
      <div className="relative h-[380px] w-full overflow-hidden">
        <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,#D946EF33,transparent_35%),radial-gradient(circle_at_80%_0%,#22D3EE33,transparent_35%),linear-gradient(135deg,#0a0a12,#05060a)] animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Skeleton className="h-6 w-32 rounded-full bg-white/10" />
              <Skeleton className="h-10 w-64 bg-white/10" />
              <Skeleton className="h-4 w-96 max-w-full bg-white/10" />
              <Skeleton className="h-4 w-20 bg-white/10" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-6 w-24 rounded-full bg-white/10" />
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-10 w-24 rounded-md bg-white/10" />
              <Skeleton className="h-10 w-32 rounded-md bg-white/10" />
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-[#1f2128] bg-[#0b0d12] p-4 shadow-[0_20px_60px_-50px_#000]"
            >
              <Skeleton className="h-3 w-16 bg-white/10" />
              <Skeleton className="mt-2 h-8 w-12 bg-white/10" />
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[#1f2128] bg-[#0b0d12] p-6 shadow-[0_25px_80px_-60px_#000]">
          <Skeleton className="h-6 w-40 bg-white/10" />
          <div className="my-4 h-px bg-white/10" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-white/10" />
            <Skeleton className="h-4 w-3/4 bg-white/10" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#1f2128] bg-[#0b0d12] p-6 shadow-[0_25px_80px_-60px_#000]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32 bg-white/10" />
              <Skeleton className="h-4 w-56 bg-white/10" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-20 rounded-md bg-white/10" />
              <Skeleton className="h-10 w-24 rounded-md bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

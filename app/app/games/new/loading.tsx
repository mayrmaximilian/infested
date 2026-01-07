import { Skeleton } from "@/components/ui/skeleton";

export default function NewGameLoading() {
  return (
    <div className="space-y-10">
      <div className="overflow-hidden rounded-3xl border border-[#24112d] bg-gradient-to-br from-[#1a0c24] via-[#0b0f1c] to-[#071019] p-8 shadow-[0_25px_80px_-60px_#000]">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div className="space-y-4">
            <Skeleton className="h-6 w-40 rounded-full" />
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-4 w-full max-w-2xl" />
            <Skeleton className="h-4 w-4/5 max-w-xl" />
            <div className="flex flex-wrap items-center gap-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-7 w-28 rounded-full" />
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="space-y-3 rounded-xl bg-black/40 p-4">
              <Skeleton className="h-4 w-28" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-14 w-14 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#1f2128] bg-[#0b0d12]">
        <div className="border-b border-[#1f2128] px-6 py-5">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <div className="space-y-6 p-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-11 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-11 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-3 w-64" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-11 w-40 rounded-md" />
            <Skeleton className="h-11 w-24 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

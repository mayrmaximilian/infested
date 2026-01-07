import { Skeleton } from "@/components/ui/skeleton";

export default function SocialLoading() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="w-full max-w-xl">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Skeleton className="h-11 flex-1" />
              <Skeleton className="h-11 w-28" />
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        <div className="flex flex-wrap gap-2 rounded-full border border-white/10 bg-white/5 p-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-full" />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
          <aside className="space-y-4">
            <div className="rounded-2xl border border-[#1f2128] bg-[#0b0d12] p-5 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 rounded-xl" />
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-[#1f2128] bg-[#0b0d12] p-5">
              <Skeleton className="h-10" />
            </div>
          </aside>

          <section className="min-h-0">
            <div className="rounded-2xl border border-[#1f2128] bg-[#0b0d12] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-11 w-11 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-9 w-20 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

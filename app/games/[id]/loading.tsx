import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function GameLandingLoading() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative h-[380px] w-full overflow-hidden">
        <Skeleton className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        <div className="absolute bottom-8 left-8 h-[200px] w-[160px]">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
        <div className="absolute bottom-8 left-[200px] right-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Skeleton className="h-6 w-32 rounded-full" />
              <Skeleton className="h-10 w-72" />
              <Skeleton className="h-4 w-full max-w-3xl" />
              <Skeleton className="h-4 w-80" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((chip) => (
                  <Skeleton key={chip} className="h-7 w-24 rounded-full" />
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary" disabled>
                &nbsp;
              </Button>
              <Button disabled>&nbsp;</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-[#1f2128] bg-[#0b0d12] p-4"
            >
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-3 h-8 w-24" />
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[#1f2128] bg-[#0b0d12] p-6">
          <Skeleton className="h-6 w-40" />
          <Separator className="my-4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-4/5" />
          <Skeleton className="mt-2 h-4 w-3/5" />
        </div>

        <div className="rounded-2xl border border-[#1f2128] bg-[#0b0d12] p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-[#1f2128] p-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-3/4" />
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[#1f2128] bg-[#0b0d12] p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-72" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-10 w-24 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

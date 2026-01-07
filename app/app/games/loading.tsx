import { Skeleton } from "@/components/ui/skeleton";

export default function MyGamesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-11 w-36 rounded-md" />
      </div>

      <div className="h-px w-full bg-white/10" />

      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#1f2128] bg-[#0b0d12]"
          >
            <div className="flex flex-col items-start gap-4 p-6 sm:flex-row">
              <Skeleton className="h-[312px] w-[250px] flex-shrink-0 rounded-md" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-[#1f2128] px-6 py-4">
              <Skeleton className="h-4 w-24" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-24 rounded-md" />
                <Skeleton className="h-9 w-24 rounded-md" />
                <Skeleton className="h-9 w-10 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

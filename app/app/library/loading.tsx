import { Skeleton } from "@/components/ui/skeleton";

export default function LibraryLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-1">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-4 w-80" />
      </header>

      {/* Library Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>

        {/* Games Grid */}
        <div className="flex flex-wrap gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton
              key={i}
              className="rounded-lg w-[140px] h-[175px]"
            />
          ))}
        </div>
      </section>
    </div>
  );
}

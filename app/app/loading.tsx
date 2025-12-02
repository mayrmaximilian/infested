import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="px-8 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-60" />
          <Skeleton className="h-4 w-80" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

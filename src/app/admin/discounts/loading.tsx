import { Skeleton } from "@/components/ui/skeleton"

export default function DiscountsLoading() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-border bg-card px-4 lg:px-6 py-4">
        <Skeleton className="h-8 w-48" />
      </div>

      <div className="p-4 lg:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-10 w-36" />
        </div>

        <div className="flex gap-2 pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24" />
          ))}
        </div>

        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}

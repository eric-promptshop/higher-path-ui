import { Skeleton } from "@/components/ui/skeleton"

export default function MenuManagerLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="border-b border-border">
        <div className="flex items-center justify-between px-4 py-3 gap-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-16" />
          </div>
        </div>
      </div>

      {/* Category tabs skeleton */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-24" />
          ))}
        </div>
      </div>

      {/* Product grid skeleton */}
      <div className="p-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-3">
              <Skeleton className="aspect-square rounded-lg mb-3" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-5 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

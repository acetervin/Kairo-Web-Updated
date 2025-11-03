import { Skeleton } from "@/components/ui/skeleton";

export default function GallerySkeleton() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Category Filters */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-32 rounded-full flex-shrink-0" />
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <Skeleton className="h-12 w-40 mx-auto rounded-lg" />
        </div>
      </div>
    </div>
  );
}


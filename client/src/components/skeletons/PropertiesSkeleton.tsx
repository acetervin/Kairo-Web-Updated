import { Skeleton } from "@/components/ui/skeleton";
import PropertySkeleton from "@/components/ui/PropertySkeleton";

export default function PropertiesSkeleton() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Filters Section */}
        <div className="mb-8 space-y-4">
          {/* Category Filters */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-32 rounded-full flex-shrink-0" />
            ))}
          </div>

          {/* Search and Sort */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-12 w-full rounded-lg md:col-span-2" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>

          {/* Price Range */}
          <div className="flex gap-4 items-center">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <Skeleton className="h-4 w-48" />
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <PropertySkeleton key={i} />
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-12 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-10 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}


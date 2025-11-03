import { Skeleton } from "@/components/ui/skeleton";
import PropertySkeleton from "@/components/ui/PropertySkeleton";

export default function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Skeleton */}
      <div className="relative h-screen overflow-hidden bg-muted">
        <Skeleton className="w-full h-full" />
        
        {/* Hero Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-6 px-4">
            <Skeleton className="h-16 w-96 mx-auto" />
            <Skeleton className="h-6 w-64 mx-auto" />
            <div className="flex justify-center gap-4 mt-8">
              <Skeleton className="h-12 w-40 rounded-lg" />
              <Skeleton className="h-12 w-40 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Featured Properties Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-4" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Property Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <PropertySkeleton key={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-10 w-48 mb-4 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="text-center space-y-3">
                <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


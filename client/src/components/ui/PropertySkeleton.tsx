import React from "react";
import { Skeleton } from "./skeleton";

interface PropertySkeletonProps {
  className?: string;
}

const PropertySkeleton: React.FC<PropertySkeletonProps> = ({ className }) => {
  return (
    <div className={`bg-card rounded-2xl h-96 shadow-sm border border-border ${className ?? ""}`}>
      <Skeleton className="h-64 rounded-t-2xl" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-4 rounded w-full" />
        <Skeleton className="h-3 rounded w-3/4" />
        <Skeleton className="h-6 rounded w-1/2" />
      </div>
    </div>
  );
};

export default PropertySkeleton;

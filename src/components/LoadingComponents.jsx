"use client";
import { memo } from 'react';

const CategorySkeleton = memo(() => {
  return (
    <div className="relative bg-gray-200 border border-[#E5E5E5] p-3 px-2 lg:p-5 before:absolute before:bottom-0 before:left-0 before:w-full before:h-1 before:bg-gray-200 shadow-lg animate-pulse rounded">
      <div className="size-10 sm:size-16 lg:size-20 xl:size-28 aspect-square mx-auto bg-gray-300 rounded" />
      <div className="mt-1 md:mt-2 h-4 bg-gray-300 rounded mx-auto w-3/4" />
    </div>
  );
});

CategorySkeleton.displayName = 'CategorySkeleton';

export const CategorySkeletonGrid = memo(({ count = 24, layout = "1" }) => {
  const getGridClasses = () => {
    switch (layout) {
      case "2":
        return "grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 [@media(max-width:360px)]:gap-1 gap-2 md:gap-3 lg:gap-4";
      default:
        return "grid grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 gap-x-[3px] max-[360px]:gap-1";
    }
  };

  return (
    <ul className={getGridClasses()}>
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <CategorySkeleton />
        </li>
      ))}
    </ul>
  );
});

CategorySkeletonGrid.displayName = 'CategorySkeletonGrid';

export const PageLoadingSkeleton = memo(() => {
  return (
    <section className="relative grow">
      <div className="rz-app-wrap sm:rounded-xl mx-auto flex flex-col gap-4 xl:flex-nowrap">
        <CategorySkeletonGrid />
        {/* Description skeleton */}
        <div className="space-y-2 mt-2.5">
          <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-4/5 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-3/5 animate-pulse" />
        </div>
        {/* Title skeleton */}
        <div className="bg-gray-200 animate-pulse rounded-xl border border-gray-300 shadow-lg text-center p-4 py-3">
          <div className="h-6 bg-gray-300 rounded mx-auto w-2/3" />
        </div>
      </div>
    </section>
  );
});

PageLoadingSkeleton.displayName = 'PageLoadingSkeleton';

// Optimized loading component that prevents layout shift
export const OptimizedLoader = memo(({ isLoading, children, fallback, minHeight = "40vh" }) => {
  if (isLoading) {
    return (
      <div style={{ minHeight }} className="flex items-center justify-center">
        {fallback || <PageLoadingSkeleton />}
      </div>
    );
  }

  return children;
});

OptimizedLoader.displayName = 'OptimizedLoader';
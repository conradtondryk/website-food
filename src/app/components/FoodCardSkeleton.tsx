import { Skeleton } from './ui/skeleton';

export default function FoodCardSkeleton() {
  return (
    <div className="w-40 sm:w-80 bg-white dark:bg-zinc-800 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-700 p-2 sm:p-4 relative">
      {/* Food Name */}
      <Skeleton className="h-4 sm:h-[28px] w-3/4 mx-auto mb-0.5 sm:mb-1" />

      {/* Portion Size */}
      <Skeleton className="h-3 sm:h-4 w-1/3 mx-auto mb-2 sm:mb-4" />

      {/* Macros Table */}
      <div className="mb-2 sm:mb-4">
        <Skeleton className="h-3 sm:h-4 w-16 mb-1 sm:mb-2" />

        {/* Table with proper spacing to match actual table */}
        <div className="w-full">
          <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="py-0.5 sm:py-1.5 flex justify-between items-center">
                <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Source */}
      <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
        <Skeleton className="h-2.5 sm:h-3 w-24 sm:w-32" />
      </div>
    </div>
  );
}

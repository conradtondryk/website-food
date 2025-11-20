import { Skeleton } from './ui/skeleton';
import { CardLayout, CardHeader, CardContent, CardFooter } from './CardLayout';

export default function FoodCardSkeleton() {
  return (
    <CardLayout>
      <CardHeader>
        {/* Food Name - Fixed height container matches FoodCard */}
        <div className="h-5 sm:h-7 mb-0.5 sm:mb-1 flex items-center justify-center w-full">
          <Skeleton className="h-full w-3/4" />
        </div>
        
        {/* Portion Size (Dropdown match) */}
        <div className="w-full flex justify-center mt-1 mb-2 sm:mb-4">
            <Skeleton className="w-1/2" style={{ height: '26px' }} />
        </div>
      </CardHeader>

      <CardContent>
        {/* Macros Table */}
        <div className="mb-2 sm:mb-4">
          {/* Title - Fixed height matches FoodCard */}
          <div className="h-4 mb-1 sm:mb-2 flex items-center">
            <Skeleton className="h-3 w-16" />
          </div>

          {/* Table with proper spacing to match actual table */}
          <div className="w-full">
            <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-5 sm:h-7 flex justify-between items-center">
                  <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                  <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        {/* Footer Source - Fixed height matches FoodCard */}
        <div className="h-4 sm:h-5 flex items-center">
          <Skeleton className="h-2.5 sm:h-3 w-24 sm:w-32" />
        </div>
      </CardFooter>
    </CardLayout>
  );
}

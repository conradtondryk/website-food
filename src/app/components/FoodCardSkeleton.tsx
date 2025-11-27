import { Skeleton } from './ui/skeleton';
import { CardLayout, CardHeader, CardContent, CardFooter } from './CardLayout';

export default function FoodCardSkeleton() {
  return (
    <CardLayout className="h-full">
      <CardHeader>
        <Skeleton className="h-3.5 sm:h-4 w-3/4" />
        <div className="w-full flex justify-center mt-2">
          <Skeleton className="h-7 w-[100px]" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-0">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`flex justify-between items-center py-1.5 sm:py-2 ${
                i !== 6 ? 'border-b border-zinc-100 dark:border-zinc-800' : ''
              }`}
            >
              <Skeleton className="h-2.5 sm:h-3 w-12 sm:w-16" />
              <Skeleton className="h-2.5 sm:h-3 w-8 sm:w-10" />
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter>
        <Skeleton className="h-2 sm:h-2.5 w-8" />
      </CardFooter>
    </CardLayout>
  );
}

import { HTMLAttributes } from 'react';

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}

function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800', className)}
      {...props}
    />
  );
}

export { Skeleton };

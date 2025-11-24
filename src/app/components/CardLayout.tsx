import { ReactNode, CSSProperties } from 'react';

interface CardLayoutProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function CardLayout({ children, className = '', style }: CardLayoutProps) {
  return (
    <div className={`w-40 sm:w-80 bg-white dark:bg-zinc-800 rounded-2xl shadow-md border border-zinc-200 dark:border-zinc-700 p-2 sm:p-4 relative flex flex-col ${className}`} style={style}>
      {children}
    </div>
  );
}

export function CardHeader({ children }: { children: ReactNode }) {
  return <div className="mb-0.5 sm:mb-1 flex flex-col items-center">{children}</div>;
}

export function CardContent({ children }: { children: ReactNode }) {
  return <div className="flex-1">{children}</div>;
}

export function CardFooter({ children }: { children: ReactNode }) {
  return <div className="mt-auto pt-2 border-t border-zinc-200 dark:border-zinc-700">{children}</div>;
}


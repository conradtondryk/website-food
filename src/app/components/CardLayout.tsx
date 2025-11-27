import { ReactNode, CSSProperties } from 'react';

interface CardLayoutProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function CardLayout({ children, className = '', style }: CardLayoutProps) {
  return (
    <div
      className={`w-36 sm:w-64 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4 relative flex flex-col ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children }: { children: ReactNode }) {
  return <div className="mb-2 sm:mb-3 flex flex-col items-center">{children}</div>;
}

export function CardContent({ children }: { children: ReactNode }) {
  return <div className="flex-1">{children}</div>;
}

export function CardFooter({ children }: { children: ReactNode }) {
  return <div className="mt-auto pt-2 border-t border-zinc-100 dark:border-zinc-800">{children}</div>;
}


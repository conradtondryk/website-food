import { CardLayout } from './CardLayout';

interface AddFoodCardProps {
  onClick: () => void;
}

export default function AddFoodCard({ onClick }: AddFoodCardProps) {
  return (
    <button
      onClick={onClick}
      className="group w-full h-full focus:outline-none"
      aria-label="Add food to compare"
    >
      <CardLayout
        className="h-full items-center justify-center border-dashed border-2 hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all cursor-pointer active:scale-95"
      >
        <div className="flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-2 sm:mb-4 w-12 h-12 sm:w-16 sm:h-16 group-hover:scale-110 transition-transform duration-200"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span className="text-xs sm:text-base font-medium text-center px-2">Add Food to Compare</span>
        </div>
      </CardLayout>
    </button>
  );
}


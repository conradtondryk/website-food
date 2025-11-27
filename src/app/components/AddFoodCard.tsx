import { Plus } from 'lucide-react';
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
      <CardLayout className="h-full items-center justify-center border-dashed bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer active:scale-[0.98]">
        <div className="flex flex-col items-center justify-center gap-2 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-400 dark:group-hover:text-zinc-500 transition-colors">
          <Plus className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={1.5} />
          <span className="text-[10px] sm:text-xs font-medium">add food</span>
        </div>
      </CardLayout>
    </button>
  );
}


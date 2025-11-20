import { Winner } from '../types';

interface WinnerCardProps {
  winner: Winner | null;
  onCompare: () => void;
  comparing: boolean;
  canCompare: boolean;
}

export default function WinnerCard({ winner, onCompare, comparing, canCompare }: WinnerCardProps) {
  return (
    <div className="w-full sm:w-96 sm:max-w-sm bg-white dark:bg-zinc-800 rounded-lg shadow-lg border-2 border-green-500 dark:border-green-600 p-3 sm:p-6">
      <h2 className="text-base sm:text-xl font-semibold text-center text-zinc-900 dark:text-zinc-100 mb-3 sm:mb-6">
        who wins
      </h2>

      {winner ? (
        <div>
          <h3 className="text-lg sm:text-2xl font-bold text-center text-green-600 dark:text-green-400 mb-2 sm:mb-4">
            {winner.foodName}
          </h3>
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-2 sm:p-4">
            <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {winner.reason}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-2 sm:py-4">
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-2">
            {canCompare
              ? 'click compare to see which food wins.'
              : 'add at least two foods to compare.'}
          </p>
          {canCompare && (
            <button
              onClick={onCompare}
              disabled={comparing}
              className="px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {comparing ? 'comparing...' : 'compare'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

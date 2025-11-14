import { Winner } from '../types';

interface WinnerCardProps {
  winner: Winner | null;
}

export default function WinnerCard({ winner }: WinnerCardProps) {
  return (
    <div className="w-full max-w-sm bg-white dark:bg-zinc-800 rounded-lg shadow-lg border-2 border-green-500 dark:border-green-600 p-6">
      <h2 className="text-xl font-semibold text-center text-zinc-900 dark:text-zinc-100 mb-6">
        who wins
      </h2>

      {winner ? (
        <div>
          <h3 className="text-2xl font-bold text-center text-green-600 dark:text-green-400 mb-4">
            {winner.foodName}
          </h3>
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4">
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {winner.reason}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center text-zinc-500 dark:text-zinc-400 py-8">
          <p className="text-sm">
            add at least two foods to see a comparison.
          </p>
        </div>
      )}
    </div>
  );
}

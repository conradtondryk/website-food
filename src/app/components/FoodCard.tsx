import { FoodItem } from '../types';

interface FoodCardProps {
  food: FoodItem;
  onPriceChange?: (price: number | undefined) => void;
}

export default function FoodCard({ food, onPriceChange }: FoodCardProps) {
  return (
    <div className="w-40 sm:w-80 bg-white dark:bg-zinc-800 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-700 p-2 sm:p-4">
      {/* Food Name */}
      <h2 className="text-sm sm:text-lg font-semibold text-center text-zinc-900 dark:text-zinc-100 mb-0.5 sm:mb-1">
        {food.name}
      </h2>
      <p className="text-[10px] sm:text-xs text-center text-zinc-500 dark:text-zinc-400 mb-2 sm:mb-4">
        per {food.portionSize}
      </p>

      {/* Macros Table - Compact on mobile */}
      <div className="mb-2 sm:mb-4">
        <h3 className="text-[10px] sm:text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 sm:mb-2">
          nutrition
        </h3>
        <table className="w-full text-[10px] sm:text-xs">
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
            <tr>
              <td className="py-0.5 sm:py-1.5 text-zinc-700 dark:text-zinc-300">calories</td>
              <td className="py-0.5 sm:py-1.5 text-right font-medium text-zinc-900 dark:text-zinc-100">
                {food.macros.calories}
              </td>
            </tr>
            <tr>
              <td className="py-0.5 sm:py-1.5 text-zinc-700 dark:text-zinc-300">protein</td>
              <td className="py-0.5 sm:py-1.5 text-right font-medium text-zinc-900 dark:text-zinc-100">
                {food.macros.protein}g
              </td>
            </tr>
            <tr>
              <td className="py-0.5 sm:py-1.5 text-zinc-700 dark:text-zinc-300">fat</td>
              <td className="py-0.5 sm:py-1.5 text-right font-medium text-zinc-900 dark:text-zinc-100">
                {(food.macros.unsaturatedFat + food.macros.saturatedFat).toFixed(2)}g
              </td>
            </tr>
            <tr>
              <td className="py-0.5 sm:py-1.5 pl-2 text-zinc-600 dark:text-zinc-400 text-[9px] sm:text-[11px]">of which saturates</td>
              <td className="py-0.5 sm:py-1.5 text-right font-medium text-zinc-900 dark:text-zinc-100">
                {food.macros.saturatedFat}g
              </td>
            </tr>
            <tr>
              <td className="py-0.5 sm:py-1.5 text-zinc-700 dark:text-zinc-300">carbs</td>
              <td className="py-0.5 sm:py-1.5 text-right font-medium text-zinc-900 dark:text-zinc-100">
                {food.macros.carbs}g
              </td>
            </tr>
            <tr>
              <td className="py-0.5 sm:py-1.5 pl-2 text-zinc-600 dark:text-zinc-400 text-[9px] sm:text-[11px]">of which sugars</td>
              <td className="py-0.5 sm:py-1.5 text-right font-medium text-zinc-900 dark:text-zinc-100">
                {food.macros.sugars}g
              </td>
            </tr>
            <tr>
              <td className="py-0.5 sm:py-1.5 text-zinc-700 dark:text-zinc-300">fibre</td>
              <td className="py-0.5 sm:py-1.5 text-right font-medium text-zinc-900 dark:text-zinc-100">
                {food.macros.fibre}g
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {food.sourceUrl && (
        <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
          <a
            href={food.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            source: {food.source === 'usda' ? 'usda fooddata central' : 'ai generated'}
          </a>
        </div>
      )}

      {!food.sourceUrl && food.source === 'ai' && (
        <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
          <span className="text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500">
            source: ai generated
          </span>
        </div>
      )}
    </div>
  );
}

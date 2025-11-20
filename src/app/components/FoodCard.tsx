import { useState } from 'react';
import { FoodItem, FoodPortion } from '../types';
import { CardLayout, CardHeader, CardContent, CardFooter } from './CardLayout';

interface FoodCardProps {
  food: FoodItem;
  onPriceChange?: (price: number | undefined) => void;
  onRemove?: () => void;
}

export default function FoodCard({ food, onPriceChange, onRemove }: FoodCardProps) {
  // Prepare portions
  const availablePortions: FoodPortion[] = food.portions && food.portions.length > 0
    ? food.portions
    : [{ amount: 1, unit: '100g', gramWeight: 100 }];

  // Find 100g portion index or default to 0
  const [selectedPortionIndex, setSelectedPortionIndex] = useState<number>(() => {
    const idx = availablePortions.findIndex(p => p.unit === '100g');
    return idx >= 0 ? idx : 0;
  });

  const selectedPortion = availablePortions[selectedPortionIndex];
  const ratio = selectedPortion.gramWeight / 100;

  const displayMacros = {
    calories: Math.round(food.macros.calories * ratio),
    protein: Number((food.macros.protein * ratio).toFixed(2)),
    unsaturatedFat: Number((food.macros.unsaturatedFat * ratio).toFixed(2)),
    saturatedFat: Number((food.macros.saturatedFat * ratio).toFixed(2)),
    carbs: Number((food.macros.carbs * ratio).toFixed(2)),
    sugars: Number((food.macros.sugars * ratio).toFixed(2)),
    fibre: Number((food.macros.fibre * ratio).toFixed(2)),
  };

  return (
    <CardLayout>
      {/* Remove button */}
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
          title="Remove"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}

      <CardHeader>
        <div className="h-5 sm:h-7 mb-0.5 sm:mb-1 flex items-center justify-center w-full">
          <h2 className="text-sm sm:text-lg font-semibold text-center text-zinc-900 dark:text-zinc-100 truncate w-full px-1">
            {food.name}
          </h2>
        </div>
        
        <div className="w-full flex justify-center mt-1 mb-2 sm:mb-4 h-[26px]">
           <div className="w-3/4">
             <select
              value={selectedPortionIndex}
              onChange={(e) => setSelectedPortionIndex(Number(e.target.value))}
              className="w-full text-[10px] sm:text-xs text-center bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer truncate"
              style={{ height: '26px' }}
            >
              {availablePortions.map((portion, index) => (
                <option key={index} value={index}>
                  per {portion.unit} {portion.unit !== '100g' && `(~${Math.round(portion.gramWeight)}g)`}
                </option>
              ))}
            </select>
           </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-2 sm:mb-4">
          {/* Fixed height title */}
          <div className="h-4 mb-1 sm:mb-2 flex items-center">
            <h3 className="text-[10px] sm:text-xs font-medium text-zinc-600 dark:text-zinc-400">
              nutrition
            </h3>
          </div>
          <table className="w-full text-[10px] sm:text-xs">
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              <tr className="h-5 sm:h-7">
                <td className="text-zinc-700 dark:text-zinc-300 align-middle">calories</td>
                <td className="text-right font-medium text-zinc-900 dark:text-zinc-100 align-middle">
                  {displayMacros.calories}
                </td>
              </tr>
              <tr className="h-5 sm:h-7">
                <td className="text-zinc-700 dark:text-zinc-300 align-middle">protein</td>
                <td className="text-right font-medium text-zinc-900 dark:text-zinc-100 align-middle">
                  {displayMacros.protein}g
                </td>
              </tr>
              <tr className="h-5 sm:h-7">
                <td className="text-zinc-700 dark:text-zinc-300 align-middle">fat</td>
                <td className="text-right font-medium text-zinc-900 dark:text-zinc-100 align-middle">
                  {(displayMacros.unsaturatedFat + displayMacros.saturatedFat).toFixed(2)}g
                </td>
              </tr>
              <tr className="h-5 sm:h-7">
                <td className="pl-2 text-zinc-600 dark:text-zinc-400 text-[9px] sm:text-[11px] align-middle">of which saturates</td>
                <td className="text-right font-medium text-zinc-900 dark:text-zinc-100 align-middle">
                  {displayMacros.saturatedFat}g
                </td>
              </tr>
              <tr className="h-5 sm:h-7">
                <td className="text-zinc-700 dark:text-zinc-300 align-middle">carbs</td>
                <td className="text-right font-medium text-zinc-900 dark:text-zinc-100 align-middle">
                  {displayMacros.carbs}g
                </td>
              </tr>
              <tr className="h-5 sm:h-7">
                <td className="pl-2 text-zinc-600 dark:text-zinc-400 text-[9px] sm:text-[11px] align-middle">of which sugars</td>
                <td className="text-right font-medium text-zinc-900 dark:text-zinc-100 align-middle">
                  {displayMacros.sugars}g
                </td>
              </tr>
              <tr className="h-5 sm:h-7">
                <td className="text-zinc-700 dark:text-zinc-300 align-middle">fibre</td>
                <td className="text-right font-medium text-zinc-900 dark:text-zinc-100 align-middle">
                  {displayMacros.fibre}g
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>

      <CardFooter>
        <div className="h-4 sm:h-5 flex items-center">
          {food.sourceUrl ? (
            <a
              href={food.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors truncate"
            >
              source: {food.source === 'usda' ? 'usda fooddata central' : 'ai generated'}
            </a>
          ) : (
            <span className="text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
              source: {food.source === 'ai' ? 'ai generated' : 'unknown'}
            </span>
          )}
        </div>
      </CardFooter>
    </CardLayout>
  );
}

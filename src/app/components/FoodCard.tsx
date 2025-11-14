import { FoodItem } from '../types';

interface FoodCardProps {
  food: FoodItem;
}

export default function FoodCard({ food }: FoodCardProps) {
  return (
    <div className="w-full max-w-xs bg-white dark:bg-zinc-800 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-700 p-4">
      {/* Food Name */}
      <h2 className="text-lg font-semibold text-center text-zinc-900 dark:text-zinc-100 mb-4">
        {food.name}
      </h2>

      {/* Macros Table */}
      <div className="mb-4">
        <h3 className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">
          nutritional information
        </h3>
        <table className="w-full text-xs">
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
            <tr>
              <td className="py-1.5 text-zinc-700 dark:text-zinc-300">calories</td>
              <td className="py-1.5 text-right font-medium text-zinc-900 dark:text-zinc-100">
                {food.macros.calories} kcal
              </td>
            </tr>
            <tr>
              <td className="py-1.5 text-zinc-700 dark:text-zinc-300">protein</td>
              <td className="py-1.5 text-right font-medium text-zinc-900 dark:text-zinc-100">
                {food.macros.protein}g
              </td>
            </tr>
            <tr>
              <td className="py-1.5 text-zinc-700 dark:text-zinc-300">unsaturated fat</td>
              <td className="py-1.5 text-right font-medium text-zinc-900 dark:text-zinc-100">
                {food.macros.unsaturatedFat}g
              </td>
            </tr>
            <tr>
              <td className="py-1.5 text-zinc-700 dark:text-zinc-300">saturated fat</td>
              <td className="py-1.5 text-right font-medium text-zinc-900 dark:text-zinc-100">
                {food.macros.saturatedFat}g
              </td>
            </tr>
            <tr>
              <td className="py-1.5 text-zinc-700 dark:text-zinc-300">carbs</td>
              <td className="py-1.5 text-right font-medium text-zinc-900 dark:text-zinc-100">
                {food.macros.carbs}g
              </td>
            </tr>
            <tr>
              <td className="py-1.5 text-zinc-700 dark:text-zinc-300">sugars</td>
              <td className="py-1.5 text-right font-medium text-zinc-900 dark:text-zinc-100">
                {food.macros.sugars}g
              </td>
            </tr>
            <tr>
              <td className="py-1.5 text-zinc-700 dark:text-zinc-300">fibre</td>
              <td className="py-1.5 text-right font-medium text-zinc-900 dark:text-zinc-100">
                {food.macros.fibre}g
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-3">
        <h3 className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">
          summary
        </h3>

        {/* Pros */}
        {food.summary.pros.length > 0 && (
          <div className="mb-2">
            <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
              pros:
            </p>
            <ul className="text-xs text-zinc-700 dark:text-zinc-300 space-y-0.5">
              {food.summary.pros.map((pro, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-1.5">+</span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cons */}
        {food.summary.cons.length > 0 && (
          <div>
            <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
              cons:
            </p>
            <ul className="text-xs text-zinc-700 dark:text-zinc-300 space-y-0.5">
              {food.summary.cons.map((con, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-1.5">-</span>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

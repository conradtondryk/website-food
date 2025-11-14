'use client';

import { useState } from 'react';
import FoodCard from './components/FoodCard';
import { FoodItem } from './types';

export default function Home() {
  const [foodQuery, setFoodQuery] = useState('');
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFoodQuery(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && foodQuery.trim()) {
      // TODO: Replace this mock data with AI API call
      const mockFoodItem: FoodItem = {
        name: foodQuery,
        macros: {
          calories: 0,
          protein: 0,
          unsaturatedFat: 0,
          saturatedFat: 0,
          carbs: 0,
          sugars: 0,
          fibre: 0,
        },
        summary: {
          pros: ['awaiting ai response...'],
          cons: ['awaiting ai response...'],
        },
      };

      setFoodItems([...foodItems, mockFoodItem]);
      setFoodQuery('');
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black">
      {/* Left side - Food cards */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex flex-col gap-6">
          {foodItems.map((food, index) => (
            <FoodCard key={index} food={food} />
          ))}
        </div>
      </div>

      {/* Center - Search */}
      <main className="flex flex-col items-center justify-center gap-6 px-8 w-full max-w-2xl">
        <h1 className="text-lg text-zinc-700 dark:text-zinc-300 text-center max-w-md">
          find your food macros. simply search for your food item to begin.
        </h1>

        <div className="w-full max-w-md">
          <input
            type="text"
            value={foodQuery}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="enter food item..."
            autoFocus
            className="w-full px-6 py-4 text-lg rounded-xl border-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
          />
          {foodQuery && (
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
              searching for: <span className="font-semibold text-zinc-700 dark:text-zinc-200">{foodQuery}</span>
            </p>
          )}
        </div>
      </main>

      {/* Right side - Reserved for future columns */}
      <div className="flex-1"></div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import FoodCard from './components/FoodCard';
import WinnerCard from './components/WinnerCard';
import { FoodItem, Winner } from './types';

export default function Home() {
  const [foodQuery, setFoodQuery] = useState('');
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [winner, setWinner] = useState<Winner | null>(null);

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

      const newFoodItems = [...foodItems, mockFoodItem];
      setFoodItems(newFoodItems);

      // TODO: Replace with AI API call to determine winner
      if (newFoodItems.length >= 2) {
        setWinner({
          foodName: mockFoodItem.name,
          reason: 'awaiting ai comparison...',
        });
      }

      setFoodQuery('');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black">
      {/* Top search bar */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-700 px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-sm text-zinc-700 dark:text-zinc-300 text-center mb-3">
            {foodItems.length === 0
              ? 'find your food macros. simply search for your food item to begin.'
              : 'select another food to compare to.'}
          </h1>
          <div className="max-w-md mx-auto">
            <input
              type="text"
              value={foodQuery}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="enter food item..."
              autoFocus
              className="w-full px-4 py-3 text-base rounded-lg border-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
            />
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 flex gap-6 px-8 py-6">
        {/* Food cards - scrollable */}
        <div className="flex-1 flex gap-6 overflow-x-auto">
          {foodItems.map((food, index) => (
            <div key={index} className="flex-shrink-0">
              <FoodCard food={food} />
            </div>
          ))}
        </div>

        {/* Winner section - fixed on right */}
        {foodItems.length > 0 && (
          <div className="flex-shrink-0">
            <WinnerCard winner={winner} />
          </div>
        )}
      </main>
    </div>
  );
}

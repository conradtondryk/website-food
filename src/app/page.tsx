'use client';

import { useState } from 'react';
import FoodCard from './components/FoodCard';
import WinnerCard from './components/WinnerCard';
import { FoodItem, Winner } from './types';

export default function Home() {
  const [foodQuery, setFoodQuery] = useState('');
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [loading, setLoading] = useState(false);
  const [comparing, setComparing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFoodQuery(e.target.value);
  };

  const fetchFoodData = async (foodName: string): Promise<FoodItem> => {
    const response = await fetch('/api/food', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ foodName }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch food data');
    }

    return response.json();
  };

  const fetchWinner = async (foods: FoodItem[]): Promise<Winner> => {
    const response = await fetch('/api/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ foods }),
    });

    if (!response.ok) {
      throw new Error('Failed to compare foods');
    }

    return response.json();
  };

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && foodQuery.trim() && !loading) {
      setLoading(true);

      try {
        // Fetch food data from AI API
        const foodData = await fetchFoodData(foodQuery);
        const newFoodItems = [...foodItems, foodData];
        setFoodItems(newFoodItems);
        setFoodQuery('');
      } catch (error) {
        console.error('Error fetching food data:', error);
        // TODO: Show error message to user
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCompare = async () => {
    if (foodItems.length < 2 || comparing) return;

    setComparing(true);
    try {
      const winnerData = await fetchWinner(foodItems);
      setWinner(winnerData);
    } catch (error) {
      console.error('Error comparing foods:', error);
    } finally {
      setComparing(false);
    }
  };

  const handleReset = () => {
    setFoodItems([]);
    setWinner(null);
    setFoodQuery('');
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
          <div className="max-w-md mx-auto flex gap-2 items-center">
            <input
              type="text"
              value={foodQuery}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="enter food item..."
              autoFocus
              disabled={loading}
              className="flex-1 px-4 py-3 text-base rounded-lg border-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {loading && (
              <div className="animate-spin h-5 w-5 border-2 border-zinc-300 dark:border-zinc-600 border-t-blue-500 rounded-full"></div>
            )}
            {foodItems.length > 0 && (
              <button
                onClick={handleReset}
                className="p-3 rounded-lg border-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                title="reset"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                </svg>
              </button>
            )}
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
            <WinnerCard
              winner={winner}
              onCompare={handleCompare}
              comparing={comparing}
              canCompare={foodItems.length >= 2}
            />
          </div>
        )}
      </main>
    </div>
  );
}

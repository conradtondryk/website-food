'use client';

import { useState } from 'react';

export default function Home() {
  const [foodQuery, setFoodQuery] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFoodQuery(e.target.value);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black">
      <main className="flex flex-col items-center justify-center gap-6 px-8">
        <h1 className="text-lg text-zinc-700 dark:text-zinc-300 text-center max-w-md">
          find your food macros. simply search for your food item to begin.
        </h1>

        <div className="w-full max-w-md">
          <input
            type="text"
            value={foodQuery}
            onChange={handleInputChange}
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
    </div>
  );
}

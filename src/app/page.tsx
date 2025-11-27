'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import FoodCard from './components/FoodCard';
import FoodCardSkeleton from './components/FoodCardSkeleton';
import AddFoodCard from './components/AddFoodCard';
import CategoryChart from './components/CategoryChart';
import Hero from './components/Hero';
import FoodDrawer from './components/FoodDrawer';
import { FoodItem } from './types';

export default function Home() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loadingCards, setLoadingCards] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'cards' | 'chart'>('cards');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const appSectionRef = useRef<HTMLElement>(null);

  const scrollToApp = () => {
    appSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectFood = async (suggestion: { displayName: string; originalName: string }) => {
    setLoadingCards(prev => prev + 1);

    try {
      const response = await fetch('/api/food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodName: suggestion.originalName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoadingCards(prev => prev - 1);
        if (data.error === 'invalid_food') {
          toast.error('food not found. try a different search term.');
        } else if (data.error === 'rate_limited') {
          toast.error(data.message);
        } else {
          toast.error('failed to fetch food data. please try again.');
        }
        return;
      }

      setFoodItems(prev => [...prev, data]);
      setLoadingCards(prev => prev - 1);

      // Auto-scroll to app section after adding first food
      if (foodItems.length === 0) {
        setTimeout(() => scrollToApp(), 100);
      }
    } catch (error) {
      console.error('Error fetching food data:', error);
      toast.error('failed to fetch food data. please try again.');
      setLoadingCards(prev => prev - 1);
    }
  };

  const handleRemoveFood = (index: number) => {
    const newFoodItems = foodItems.filter((_, i) => i !== index);
    setFoodItems(newFoodItems);

    if (newFoodItems.length < 2) {
      setViewMode('cards');
    }
  };

  const handleOpenDrawer = () => {
    setDrawerOpen(true);
  };

  const existingFoodNames = foodItems.map(item => item.name.toLowerCase());

  return (
    <div className="h-screen overflow-y-auto snap-y snap-mandatory">
      {/* Hero Section */}
      <div className="snap-start">
        <Hero onScrollToApp={scrollToApp} />
      </div>

      {/* App Section */}
      <section
        ref={appSectionRef}
        className="snap-start min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col"
      >
        {/* View toggle - only show when foods exist */}
        {(foodItems.length > 0 || loadingCards > 0) && (
          <div className="flex justify-center pt-4 pb-2">
            <div className="inline-flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-0.5 relative">
              <motion.div
                layoutId="activeTab"
                className="absolute bg-white dark:bg-zinc-700 rounded-md shadow-sm"
                style={{
                  top: '2px',
                  bottom: '2px',
                  left: viewMode === 'cards' ? '2px' : 'auto',
                  right: viewMode === 'chart' ? '2px' : 'auto',
                  width: 'calc(50% - 2px)',
                }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 30,
                }}
              />
              <button
                onClick={() => setViewMode('cards')}
                className={`relative px-4 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  viewMode === 'cards'
                    ? 'text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => foodItems.length >= 2 && setViewMode('chart')}
                disabled={foodItems.length < 2}
                className={`relative px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  viewMode === 'chart'
                    ? 'text-zinc-900 dark:text-zinc-100'
                    : foodItems.length < 2
                    ? 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer'
                }`}
              >
                Chart
              </button>
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="flex-1 flex flex-col px-3 sm:px-6 py-3 sm:py-5">
          {viewMode === 'cards' ? (
            <div className={`flex-1 flex ${foodItems.length === 0 && loadingCards === 0 ? 'items-center justify-center' : 'items-start'}`}>
              {foodItems.length === 0 && loadingCards === 0 ? (
                /* Empty state - centered add food prompt */
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center">
                    add foods to compare their nutrition
                  </p>
                  <AddFoodCard onClick={handleOpenDrawer} />
                </div>
              ) : (
                /* Food cards */
                <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 snap-x snap-mandatory w-full">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {foodItems.map((food, index) => (
                      <motion.div
                        key={food.id}
                        layout
                        initial={{ opacity: 1, scale: 1 }}
                        exit={{
                          opacity: 0,
                          scale: 0.95,
                          transition: { duration: 0.15 }
                        }}
                        transition={{
                          layout: { duration: 0.15, ease: "easeInOut" },
                          opacity: { duration: 0.15 }
                        }}
                        className="snap-start"
                      >
                        <FoodCard
                          food={food}
                          onRemove={() => handleRemoveFood(index)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Skeleton cards while loading */}
                  {[...Array(loadingCards)].map((_, index) => (
                    <div key={`skeleton-${index}`} className="snap-start">
                      <FoodCardSkeleton />
                    </div>
                  ))}

                  {/* Add Food Button */}
                  <div className="snap-start">
                    <AddFoodCard onClick={handleOpenDrawer} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <CategoryChart foods={foodItems} />
          )}
        </div>
      </section>

      {/* Food Selection Drawer */}
      <FoodDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSelectFood={handleSelectFood}
        existingFoodNames={existingFoodNames}
      />
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import FoodCard from './components/FoodCard';
import FoodCardSkeleton from './components/FoodCardSkeleton';
import AddFoodCard from './components/AddFoodCard';
import CategoryChart from './components/CategoryChart';
import { SearchIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';
import { Input } from '@/app/components/ui/input';
import { FoodItem } from './types';

export default function Home() {
  const [foodQuery, setFoodQuery] = useState('');
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCards, setLoadingCards] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'cards' | 'chart'>('cards');
  const [suggestions, setSuggestions] = useState<Array<{ displayName: string; originalName: string }>>([]);
  const [showSlowLoadingMessage, setShowSlowLoadingMessage] = useState(false);
  const [showCommandList, setShowCommandList] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close command list when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowCommandList(false);
      }
    };

    if (showCommandList) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCommandList]);

  useEffect(() => {
    if (foodQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await fetch('/api/food/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ foodName: foodQuery.trim() }),
        });

        if (response.ok) {
          const data = await response.json();
          // Filter out foods that are already added
          const existingFoodNames = foodItems.map(item => item.name.toLowerCase());
          const filtered = (data.suggestions || []).filter(
            (suggestion: { displayName: string; originalName: string }) =>
              !existingFoodNames.includes(suggestion.displayName.toLowerCase())
          );
          setSuggestions(filtered);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [foodQuery, foodItems]);

  // Show slow loading message after 1.5 seconds for cold start
  useEffect(() => {
    if (loadingCards > 0 && foodItems.length === 0) {
      const timer = setTimeout(() => {
        setShowSlowLoadingMessage(true);
      }, 1500);

      return () => {
        clearTimeout(timer);
        setShowSlowLoadingMessage(false);
      };
    } else {
      setShowSlowLoadingMessage(false);
    }
  }, [loadingCards, foodItems.length]);

  const handleSuggestionClick = async (suggestion: { displayName: string; originalName: string }) => {
    setSuggestions([]);
    setFoodQuery('');
    setLoading(true);
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
    } catch (error) {
      console.error('Error fetching food data:', error);
      toast.error('failed to fetch food data. please try again.');
      setLoadingCards(prev => prev - 1);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFood = (index: number) => {
    const newFoodItems = foodItems.filter((_, i) => i !== index);
    setFoodItems(newFoodItems);

    if (newFoodItems.length < 2) {
      setViewMode('cards');
    }
  };

  const handleFocusSearch = () => {
    // Immediate focus for mobile keyboard
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    // Then scroll
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Show results if applicable
    setShowCommandList(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Top search bar */}
      <header className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800 px-4 py-3 sm:py-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mb-2.5">
            {foodItems.length === 0
              ? 'search for a food to view its macros'
              : 'add another food to compare'}
          </p>
          <Popover open={showCommandList && foodQuery.trim().length >= 2} onOpenChange={setShowCommandList}>
            <div ref={searchContainerRef} className="relative">
              <PopoverTrigger asChild>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="search foods..."
                    value={foodQuery}
                    onChange={(e) => setFoodQuery(e.target.value)}
                    onFocus={() => setShowCommandList(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && suggestions.length > 0) {
                        handleSuggestionClick(suggestions[0]);
                        setShowCommandList(false);
                      }
                    }}
                    disabled={loading}
                    className="pl-9 h-10 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0 border-zinc-200 dark:border-zinc-700"
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
                onInteractOutside={(e) => {
                  if (searchContainerRef.current?.contains(e.target as Node)) {
                    e.preventDefault();
                  }
                }}
              >
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.1 }}
                    className="max-h-[280px] overflow-y-auto"
                  >
                    {suggestions.length === 0 ? (
                      <div className="px-3 py-6 text-center text-xs text-zinc-400">
                        no results found
                      </div>
                    ) : (
                      <div className="py-1">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSuggestionClick(suggestion);
                              setShowCommandList(false);
                            }}
                            className="flex w-full items-center px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          >
                            {suggestion.displayName}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </PopoverContent>
            </div>
          </Popover>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 flex flex-col gap-3 sm:gap-5 px-3 sm:px-6 py-3 sm:py-5">
        {/* View toggle */}
        {(foodItems.length > 0 || loadingCards > 0) && (
          <div className="flex justify-center">
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

        {/* Food cards or chart */}
        <div className="flex-1">
          {viewMode === 'cards' ? (
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
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
              {foodItems.length > 0 && (
                <div className="snap-start">
                  <AddFoodCard onClick={handleFocusSearch} />
                </div>
              )}

              {/* Slow loading message */}
              {showSlowLoadingMessage && (
                <div className="flex-shrink-0 flex items-center justify-center w-36 sm:w-72">
                  <div className="text-center">
                    <div className="text-xs text-zinc-400 animate-pulse">warming up...</div>
                    <div className="text-[10px] text-zinc-300 mt-1">may take a few seconds</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <CategoryChart foods={foodItems} />
          )}
        </div>
      </main>
    </div>
  );
}

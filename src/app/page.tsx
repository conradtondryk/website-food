'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FoodCard from './components/FoodCard';
import FoodCardSkeleton from './components/FoodCardSkeleton';
import AddFoodCard from './components/AddFoodCard';
import WinnerCard from './components/WinnerCard';
import CategoryChart from './components/CategoryChart';
import InfoHoverCard from './components/InfoHoverCard';
import { SearchIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';
import { Input } from '@/app/components/ui/input';
import { FoodItem, Winner } from './types';

export default function Home() {
  const [foodQuery, setFoodQuery] = useState('');
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCards, setLoadingCards] = useState<number>(0);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [basePortionSize, setBasePortionSize] = useState<string | null>(null);
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
          setSuggestions(data.suggestions || []);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [foodQuery]);

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

  const fetchWinner = async (foods: FoodItem[]): Promise<void> => {
    const response = await fetch('/api/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ foods }),
    });

    if (!response.ok) {
      throw new Error('Failed to compare foods');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let currentWinner: Winner = { foodName: '', reason: '' };

    if (!reader) {
      throw new Error('No response body');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;

      const winnerMatch = fullText.match(/WINNER:\s*(.+?)(?:\n|$)/i);
      const reasonMatch = fullText.match(/REASON:\s*([\s\S]+)/i);

      if (winnerMatch) {
        currentWinner.foodName = winnerMatch[1].trim();
      }

      if (reasonMatch) {
        currentWinner.reason = reasonMatch[1].trim();
      }

      if (currentWinner.foodName) {
        setWinner({ ...currentWinner });
      }
    }
  };

  const handleSuggestionClick = async (suggestion: { displayName: string; originalName: string }) => {
    setSuggestions([]);
    setFoodQuery('');
    setLoading(true);
    setError(null);

    // Show skeleton immediately
    setLoadingCards(prev => prev + 1);

    try {
      const response = await fetch('/api/food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodName: suggestion.originalName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoadingCards(prev => prev - 1);
        if (data.error === 'invalid_food') {
          setError('food not found. try a different search term.');
        } else if (data.error === 'rate_limited') {
          setError(data.message);
        } else {
          setError('failed to fetch food data. please try again.');
        }
        return;
      }

      if (foodItems.length === 0 && data.portionSize) {
        setBasePortionSize(data.portionSize);
      }

      const newFoodItems = [...foodItems, data];
      setFoodItems(newFoodItems);
      setLoadingCards(prev => prev - 1);

      if (winner) {
        setWinner(null);
      }
    } catch (error) {
      console.error('Error fetching food data:', error);
      setError('failed to fetch food data. please try again.');
      setLoadingCards(prev => prev - 1);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && foodQuery.trim() && !loading) {
      // If there are suggestions, select the first one
      if (suggestions.length > 0) {
        handleSuggestionClick(suggestions[0]);
        return;
      }

      setLoading(true);
      setError(null);

      // Show skeleton immediately
      setLoadingCards(prev => prev + 1);

      try {
        const response = await fetch('/api/food', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            foodName: foodQuery,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setLoadingCards(prev => prev - 1);
          if (data.error === 'invalid_food') {
            setError('food not found. try a different search term.');
          } else if (data.error === 'rate_limited') {
            setError(data.message);
          } else {
            setError('failed to fetch food data. please try again.');
          }
          return;
        }

        if (foodItems.length === 0 && data.portionSize) {
          setBasePortionSize(data.portionSize);
        }

        const newFoodItems = [...foodItems, data];
        setFoodItems(newFoodItems);
        setLoadingCards(prev => prev - 1);

        setFoodQuery('');
        setSuggestions([]);
        if (winner) {
          setWinner(null);
        }
      } catch (error) {
        console.error('Error fetching food data:', error);
        setError('failed to fetch food data. please try again.');
        setLoadingCards(prev => prev - 1);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCompare = async () => {
    if (foodItems.length < 2 || comparing) return;

    setComparing(true);
    setWinner(null);
    try {
      await fetchWinner(foodItems);
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
    setBasePortionSize(null);
  };

  const handlePriceChange = (index: number, price: number | undefined) => {
    const newFoodItems = [...foodItems];
    newFoodItems[index] = { ...newFoodItems[index], price };
    setFoodItems(newFoodItems);
  };

  const handleRemoveFood = (index: number) => {
    const newFoodItems = foodItems.filter((_, i) => i !== index);
    setFoodItems(newFoodItems);

    // Reset winner if we have less than 2 foods
    if (newFoodItems.length < 2) {
      setWinner(null);
      setViewMode('cards'); // Switch back to cards view
    }

    // Reset base portion size if we removed all foods
    if (newFoodItems.length === 0) {
      setBasePortionSize(null);
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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black">
      <InfoHoverCard />
      {/* Top search bar */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-700 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-sm text-zinc-700 dark:text-zinc-300 text-center mb-3">
            {foodItems.length === 0
              ? 'find your food macros. simply search for your food item to begin.'
              : 'select another food to compare to.'}
          </h1>
          {error && (
            <div className="max-w-md mx-auto mb-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full">
              <p className="text-sm text-blue-700 dark:text-blue-300">{error}</p>
            </div>
          )}
          <Popover open={showCommandList && foodQuery.trim().length >= 2} onOpenChange={setShowCommandList}>
            <div ref={searchContainerRef} className="max-w-md mx-auto relative">
              <PopoverTrigger asChild>
                <div className="relative group">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-transform group-hover:scale-110 duration-200 pointer-events-none z-10" />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="enter food item..."
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
                    className="pl-9 pr-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:border-zinc-400 dark:hover:border-zinc-500 transition-all"
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0"
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
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.1 }}
                    className="max-h-[300px] overflow-y-auto"
                  >
                    {suggestions.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                        no results found
                      </div>
                    ) : (
                      <div className="p-1">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSuggestionClick(suggestion);
                              setShowCommandList(false);
                            }}
                            className="relative flex w-full cursor-pointer items-center rounded-md px-3 py-2.5 text-sm outline-hidden hover:bg-accent hover:text-accent-foreground transition-colors"
                          >
                            <SearchIcon className="mr-2 h-4 w-4 opacity-50" />
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
      <main className="flex-1 flex flex-col gap-4 sm:gap-6 px-4 sm:px-8 py-4 sm:py-6">
        {/* View toggle - always visible when there are items or loading */}
        {(foodItems.length > 0 || loadingCards > 0) && (
          <div className="flex justify-center">
            <div className="inline-flex rounded-full border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 p-1 relative">
              {/* Sliding background */}
              <motion.div
                layoutId="activeTab"
                className="absolute bg-blue-500 rounded-full"
                style={{
                  top: '4px',
                  bottom: '4px',
                  left: viewMode === 'cards' ? '4px' : 'auto',
                  right: viewMode === 'chart' ? '4px' : 'auto',
                  width: 'calc(50% - 4px)',
                }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 30,
                }}
              />
              <button
                onClick={() => setViewMode('cards')}
                className={`relative px-3 py-1.5 text-sm rounded-full transition-colors cursor-pointer ${
                  viewMode === 'cards'
                    ? 'text-white'
                    : 'text-zinc-700 dark:text-zinc-300'
                } ${
                  viewMode !== 'cards' ? 'before:content-[""] before:absolute before:inset-0.5 before:bg-zinc-100/50 dark:before:bg-zinc-700/50 before:rounded-full before:opacity-0 hover:before:opacity-100 before:transition-opacity before:-z-10' : ''
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => foodItems.length >= 2 && setViewMode('chart')}
                disabled={foodItems.length < 2}
                className={`relative px-3 py-1.5 text-sm rounded-full transition-colors ${
                  viewMode === 'chart'
                    ? 'text-white'
                    : foodItems.length < 2
                    ? 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                    : 'text-zinc-700 dark:text-zinc-300 cursor-pointer'
                } ${
                  viewMode !== 'chart' && foodItems.length >= 2 ? 'before:content-[""] before:absolute before:inset-0.5 before:bg-zinc-100/50 dark:before:bg-zinc-700/50 before:rounded-full before:opacity-0 hover:before:opacity-100 before:transition-opacity before:-z-10' : ''
                }`}
              >
                Chart
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Food cards or chart - scrollable horizontally on mobile */}
          <div className="flex-1 grid grid-flow-col auto-cols-max gap-3 sm:gap-6 overflow-x-auto pb-4 items-stretch">
            {viewMode === 'cards' ? (
              <>
                <AnimatePresence mode="popLayout" initial={false}>
                  {foodItems.map((food, index) => (
                    <motion.div
                      key={food.id}
                      layout
                      initial={{ opacity: 1, scale: 1 }}
                      exit={{
                        opacity: 0,
                        scale: 0.9,
                        transition: { duration: 0.15 }
                      }}
                      transition={{
                        layout: { duration: 0.15, ease: "easeInOut" },
                        opacity: { duration: 0.15 }
                      }}
                    >
                      <FoodCard
                        food={food}
                        onPriceChange={(price) => handlePriceChange(index, price)}
                        onRemove={() => handleRemoveFood(index)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {/* Show skeleton cards while loading */}
                {[...Array(loadingCards)].map((_, index) => (
                  <div key={`skeleton-${index}`}>
                    <FoodCardSkeleton />
                  </div>
                ))}

                {/* Add Food Button */}
                {foodItems.length > 0 && (
                  <div>
                    <AddFoodCard onClick={handleFocusSearch} />
                  </div>
                )}

                {/* Show slow loading message for cold start */}
                {showSlowLoadingMessage && (
                  <div className="flex-shrink-0 flex items-center justify-center w-40 sm:w-80">
                    <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                      <div className="animate-pulse">warming up database...</div>
                      <div className="text-xs mt-2">this may take a few seconds</div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full">
                <CategoryChart foods={foodItems} />
              </div>
            )}
          </div>

          {/* Winner section - bottom on mobile, right on desktop */}
          {/* Temporarily hidden - keeping logic for later
          {foodItems.length > 0 && (
            <div className="flex-shrink-0 w-full lg:w-auto">
              <WinnerCard
                winner={winner}
                onCompare={handleCompare}
                comparing={comparing}
                canCompare={foodItems.length >= 2}
              />
            </div>
          )}
          */}
        </div>
      </main>
    </div>
  );
}

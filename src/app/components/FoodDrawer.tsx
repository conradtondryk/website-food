'use client';

import { useState, useEffect } from 'react';
import { Drawer } from 'vaul';
import { Search, ChevronLeft } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import type { FoodCategory } from '@/app/api/food/foods';

interface FoodDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectFood: (suggestion: { displayName: string; originalName: string }) => void;
  existingFoodNames: string[];
}

// Display names for categories
const categoryLabels: Record<FoodCategory, string> = {
  meat: 'meat',
  seafood: 'seafood',
  dairy: 'dairy',
  eggs: 'eggs',
  fruits: 'fruits',
  vegetables: 'vegetables',
  grains: 'grains',
  legumes: 'legumes',
  nuts: 'nuts & seeds',
  beverages: 'beverages',
  snacks: 'snacks',
  condiments: 'condiments',
};

// Order for displaying categories
const categoryOrder: FoodCategory[] = [
  'meat',
  'seafood',
  'dairy',
  'eggs',
  'fruits',
  'vegetables',
  'grains',
  'legumes',
  'nuts',
  'beverages',
  'snacks',
  'condiments',
];

export default function FoodDrawer({ open, onOpenChange, onSelectFood, existingFoodNames }: FoodDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ displayName: string; originalName: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | null>(null);
  const [categoryFoods, setCategoryFoods] = useState<Array<{ displayName: string; originalName: string }>>([]);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<Record<string, number>>({});

  // Fetch available categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/food/by-category');
        if (response.ok) {
          const data = await response.json();
          setAvailableCategories(data.categories || {});
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Reset state when drawer closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setSuggestions([]);
      setSelectedCategory(null);
      setCategoryFoods([]);
    }
  }, [open]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setSelectedCategory(null); // Clear category when searching

    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch('/api/food/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodName: query.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
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
    } finally {
      setIsSearching(false);
    }
  };

  const handleCategoryClick = async (category: FoodCategory) => {
    setSelectedCategory(category);
    setSearchQuery(''); // Clear search when selecting category
    setSuggestions([]);
    setLoadingCategory(true);

    try {
      const response = await fetch(`/api/food/by-category?category=${category}`);
      if (response.ok) {
        const data = await response.json();
        const filtered = (data.foods || []).filter(
          (food: { displayName: string; originalName: string }) =>
            !existingFoodNames.includes(food.displayName.toLowerCase())
        );
        setCategoryFoods(filtered);
      } else {
        setCategoryFoods([]);
      }
    } catch (error) {
      console.error('Error fetching category foods:', error);
      setCategoryFoods([]);
    } finally {
      setLoadingCategory(false);
    }
  };

  const handleSelectFood = (food: { displayName: string; originalName: string }) => {
    onSelectFood(food);
    setSearchQuery('');
    setSuggestions([]);
    setSelectedCategory(null);
    setCategoryFoods([]);
    onOpenChange(false);
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setCategoryFoods([]);
  };

  // Filter categories to only show ones with foods
  const visibleCategories = categoryOrder.filter(
    (cat) => availableCategories[cat] && availableCategories[cat] > 0
  );

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mt-24 flex h-[85vh] flex-col rounded-t-2xl bg-white dark:bg-zinc-900">
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Handle */}
            <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-zinc-300 dark:bg-zinc-700" />

            {/* Header */}
            <div className="px-4 pt-4 pb-3">
              {selectedCategory ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBack}
                    className="p-1 -ml-1 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <Drawer.Title className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                      {categoryLabels[selectedCategory]}
                    </Drawer.Title>
                    <Drawer.Description className="text-xs text-zinc-500 dark:text-zinc-400">
                      {categoryFoods.length} items
                    </Drawer.Description>
                  </div>
                </div>
              ) : (
                <>
                  <Drawer.Title className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                    add food
                  </Drawer.Title>
                  <Drawer.Description className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    search or browse categories
                  </Drawer.Description>
                </>
              )}
            </div>

            {/* Search - always visible */}
            <div className="px-4 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  type="text"
                  placeholder="search foods..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9 h-10 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-8">
              {searchQuery.trim().length >= 2 ? (
                /* Search Results */
                <div>
                  {isSearching ? (
                    <div className="py-8 text-center text-xs text-zinc-400">
                      searching...
                    </div>
                  ) : suggestions.length === 0 ? (
                    <div className="py-8 text-center text-xs text-zinc-400">
                      no results found
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectFood(suggestion)}
                          className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          {suggestion.displayName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : selectedCategory ? (
                /* Category Foods List */
                <div>
                  {loadingCategory ? (
                    <div className="py-8 text-center text-xs text-zinc-400">
                      loading...
                    </div>
                  ) : categoryFoods.length === 0 ? (
                    <div className="py-8 text-center text-xs text-zinc-400">
                      no foods in this category yet
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {categoryFoods.map((food, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectFood(food)}
                          className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          {food.displayName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Categories Grid */
                <div className="grid grid-cols-2 gap-2">
                  {visibleCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryClick(category)}
                      className="flex flex-col items-start p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-left"
                    >
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {categoryLabels[category]}
                      </span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        {availableCategories[category]} items
                      </span>
                    </button>
                  ))}
                  {visibleCategories.length === 0 && (
                    <div className="col-span-2 py-8 text-center text-xs text-zinc-400">
                      no categories available yet
                      <br />
                      <span className="text-zinc-300">use search to find foods</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

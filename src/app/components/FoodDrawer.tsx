'use client';

import { useState } from 'react';
import { Drawer } from 'vaul';
import { Search, ChevronRight } from 'lucide-react';
import { Input } from '@/app/components/ui/input';

interface FoodDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectFood: (suggestion: { displayName: string; originalName: string }) => void;
  existingFoodNames: string[];
}

const categories = [
  {
    name: 'protein',
    subcategories: ['beef', 'chicken', 'pork', 'fish', 'seafood', 'lamb', 'turkey'],
  },
  {
    name: 'dairy & eggs',
    subcategories: ['milk', 'cheese', 'yogurt', 'eggs', 'butter'],
  },
  {
    name: 'fruits',
    subcategories: ['apple', 'banana', 'orange', 'berries', 'tropical'],
  },
  {
    name: 'vegetables',
    subcategories: ['leafy greens', 'root vegetables', 'cruciferous', 'peppers'],
  },
  {
    name: 'grains',
    subcategories: ['rice', 'bread', 'pasta', 'oats', 'cereal'],
  },
  {
    name: 'legumes & nuts',
    subcategories: ['beans', 'lentils', 'nuts', 'seeds', 'tofu'],
  },
];

export default function FoodDrawer({ open, onOpenChange, onSelectFood, existingFoodNames }: FoodDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ displayName: string; originalName: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

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

  const handleSelectFood = (suggestion: { displayName: string; originalName: string }) => {
    onSelectFood(suggestion);
    setSearchQuery('');
    setSuggestions([]);
    onOpenChange(false);
  };

  const handleCategorySearch = (term: string) => {
    handleSearch(term);
  };

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
              <Drawer.Title className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                add food
              </Drawer.Title>
              <Drawer.Description className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                search or browse categories
              </Drawer.Description>
            </div>

            {/* Search */}
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
              ) : (
                /* Categories */
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category.name}>
                      <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
                        {category.name}
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {category.subcategories.map((sub) => (
                          <button
                            key={sub}
                            onClick={() => handleCategorySearch(sub)}
                            className="px-3 py-1.5 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

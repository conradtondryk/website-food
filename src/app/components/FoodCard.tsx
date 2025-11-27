'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { FoodItem, FoodPortion } from '../types';
import { CardLayout, CardHeader, CardContent, CardFooter } from './CardLayout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';

interface FoodCardProps {
  food: FoodItem;
  onRemove?: () => void;
}

export default function FoodCard({ food, onRemove }: FoodCardProps) {
  const availablePortions: FoodPortion[] = food.portions && food.portions.length > 0
    ? food.portions
    : [{ amount: 1, unit: '100g', gramWeight: 100 }];

  const [selectedPortionIndex, setSelectedPortionIndex] = useState<string>(() => {
    const idx = availablePortions.findIndex(p => p.unit === '100g');
    return (idx >= 0 ? idx : 0).toString();
  });

  const selectedPortion = availablePortions[parseInt(selectedPortionIndex)];
  const ratio = selectedPortion.gramWeight / 100;

  const displayMacros = {
    calories: Math.round(food.macros.calories * ratio),
    protein: Number((food.macros.protein * ratio).toFixed(1)),
    unsaturatedFat: Number((food.macros.unsaturatedFat * ratio).toFixed(1)),
    saturatedFat: Number((food.macros.saturatedFat * ratio).toFixed(1)),
    carbs: Number((food.macros.carbs * ratio).toFixed(1)),
    sugars: Number((food.macros.sugars * ratio).toFixed(1)),
    fibre: Number((food.macros.fibre * ratio).toFixed(1)),
  };

  const nutritionRows = [
    { label: 'calories', value: displayMacros.calories, unit: '' },
    { label: 'protein', value: displayMacros.protein, unit: 'g' },
    { label: 'fat', value: Number((displayMacros.unsaturatedFat + displayMacros.saturatedFat).toFixed(1)), unit: 'g' },
    { label: 'saturates', value: displayMacros.saturatedFat, unit: 'g', indent: true },
    { label: 'carbs', value: displayMacros.carbs, unit: 'g' },
    { label: 'sugars', value: displayMacros.sugars, unit: 'g', indent: true },
    { label: 'fibre', value: displayMacros.fibre, unit: 'g' },
  ];

  return (
    <CardLayout className="h-full">
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 rounded-full text-zinc-300 hover:text-zinc-500 dark:text-zinc-600 dark:hover:text-zinc-400 transition-colors cursor-pointer"
          title="Remove"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      )}

      <CardHeader>
        <h2 className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 text-center px-4 line-clamp-2">
          {food.name}
        </h2>

        <div className="w-full flex justify-center mt-2">
          <Select value={selectedPortionIndex} onValueChange={setSelectedPortionIndex}>
            <SelectTrigger className="w-auto min-w-[100px] text-[10px] sm:text-xs h-7 px-2.5 justify-center text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 cursor-pointer" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availablePortions.map((portion, index) => (
                <SelectItem key={index} value={index.toString()} className="text-[10px] sm:text-xs cursor-pointer">
                  {portion.unit} {portion.unit !== '100g' && `(${Math.round(portion.gramWeight)}g)`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-0">
          {nutritionRows.map((row, index) => (
            <div
              key={row.label}
              className={`flex justify-between items-center py-1.5 sm:py-2 ${
                index !== nutritionRows.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800' : ''
              }`}
            >
              <span className={`text-[10px] sm:text-xs ${
                row.indent
                  ? 'pl-2 text-zinc-400 dark:text-zinc-500'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}>
                {row.label}
              </span>
              <span className="text-[10px] sm:text-xs font-medium text-zinc-900 dark:text-zinc-100 tabular-nums">
                {row.value}{row.unit}
              </span>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter>
        {food.sourceUrl ? (
          <a
            href={food.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] sm:text-[10px] text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors"
          >
            {food.source === 'usda' ? 'usda' : 'ai'}
          </a>
        ) : (
          <span className="text-[9px] sm:text-[10px] text-zinc-300 dark:text-zinc-600">
            {food.source === 'ai' ? 'ai' : '—'}
          </span>
        )}
      </CardFooter>
    </CardLayout>
  );
}

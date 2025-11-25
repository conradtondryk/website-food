'use client';

import { useState } from 'react';
import { FoodItem } from '../types';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartConfig,
} from '@/app/components/ui/chart';

interface CategoryChartProps {
  foods: FoodItem[];
}

type Category = {
  key: keyof FoodItem['macros'] | 'totalFat' | 'all' | 'ratios';
  label: string;
  shortLabel?: string;
  color: string;
  unit: string;
  getValue?: (food: FoodItem) => number;
};

const categories: Category[] = [
  { key: 'all', label: 'All', color: '#000000', unit: '' },
  { key: 'calories', label: 'Calories', color: '#f97316', unit: '' },
  { key: 'protein', label: 'Protein', color: '#3b82f6', unit: 'g' },
  {
    key: 'totalFat',
    label: 'Fat',
    color: '#10b981',
    unit: 'g',
    getValue: (food) => food.macros.unsaturatedFat + food.macros.saturatedFat
  },
  { key: 'saturatedFat', label: 'of which Saturates', shortLabel: 'Saturates', color: '#ef4444', unit: 'g' },
  { key: 'carbs', label: 'Carbs', color: '#f59e0b', unit: 'g' },
  { key: 'sugars', label: 'of which Sugars', shortLabel: 'Sugars', color: '#ec4899', unit: 'g' },
  { key: 'fibre', label: 'Fibre', color: '#8b5cf6', unit: 'g' },
  { key: 'ratios', label: 'Ratios', color: '#06b6d4', unit: 'g/kcal' },
];

const macroCategories: Category[] = [
  { key: 'calories', label: 'Calories', color: '#f97316', unit: '' },
  { key: 'protein', label: 'Protein', color: '#3b82f6', unit: 'g' },
  {
    key: 'totalFat',
    label: 'Fat',
    color: '#10b981',
    unit: 'g',
    getValue: (food) => food.macros.unsaturatedFat + food.macros.saturatedFat
  },
  { key: 'saturatedFat', label: 'of which Saturates', shortLabel: 'Saturates', color: '#ef4444', unit: 'g' },
  { key: 'carbs', label: 'Carbs', color: '#f59e0b', unit: 'g' },
  { key: 'sugars', label: 'of which Sugars', shortLabel: 'Sugars', color: '#ec4899', unit: 'g' },
  { key: 'fibre', label: 'Fibre', color: '#8b5cf6', unit: 'g' },
];

const ratioCategories: Category[] = [
  { key: 'protein', label: 'Protein per Calorie', shortLabel: 'Protein/kcal', color: '#3b82f6', unit: 'g/kcal' },
  { key: 'totalFat', label: 'Fat per Calorie', shortLabel: 'Fat/kcal', color: '#10b981', unit: 'g/kcal', getValue: (food) => food.macros.unsaturatedFat + food.macros.saturatedFat },
  { key: 'carbs', label: 'Carbs per Calorie', shortLabel: 'Carbs/kcal', color: '#f59e0b', unit: 'g/kcal' },
];

// Generate colors for foods
const foodColors = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f97316', // orange
  '#ef4444', // red
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f43f5e', // rose
];

export default function CategoryChart({ foods }: CategoryChartProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>(categories[0]);

  if (foods.length < 2) return null;

  // Generate chart config for shadcn
  const generateChartConfig = (): ChartConfig => {
    if (selectedCategory.key === 'all' || selectedCategory.key === 'ratios') {
      // For grouped bar charts, create config for each food
      const config: ChartConfig = {};
      foods.forEach((food, index) => {
        // Create a safe key by replacing spaces and special characters
        const safeKey = `food${index}`;
        config[safeKey] = {
          label: food.name,
          color: foodColors[index % foodColors.length],
        };
      });
      return config;
    } else {
      // For single category view
      return {
        value: {
          label: selectedCategory.label,
          color: selectedCategory.color,
        },
      };
    }
  };

  // Generate data for "All" view
  const getAllViewData = () => {
    return macroCategories.map((category) => {
      const entry: any = {
        name: category.shortLabel || category.label,
        fullLabel: category.label,
        unit: category.unit,
      };

      foods.forEach((food, index) => {
        const value = category.getValue
          ? category.getValue(food)
          : food.macros[category.key as keyof FoodItem['macros']];
        entry[`food${index}`] = value;
      });

      return entry;
    });
  };

  // Generate data for "Ratios" view
  const getRatiosViewData = () => {
    return ratioCategories.map((category) => {
      const entry: any = {
        name: category.shortLabel || category.label,
        fullLabel: category.label,
        unit: category.unit,
      };

      foods.forEach((food, index) => {
        const macroValue = category.getValue
          ? category.getValue(food)
          : food.macros[category.key as keyof FoodItem['macros']];
        const ratio = food.macros.calories > 0
          ? macroValue / food.macros.calories
          : 0;
        entry[`food${index}`] = Number(ratio.toFixed(4));
      });

      return entry;
    });
  };

  const chartData = selectedCategory.key === 'all'
    ? getAllViewData()
    : selectedCategory.key === 'ratios'
    ? getRatiosViewData()
    : foods.map((food) => ({
        name: food.name,
        value: selectedCategory.getValue
          ? selectedCategory.getValue(food)
          : food.macros[selectedCategory.key as keyof FoodItem['macros']],
      }));

  const chartConfig = generateChartConfig();

  // Debug logging
  if (selectedCategory.key === 'all' || selectedCategory.key === 'ratios') {
    console.log('Chart Data:', JSON.stringify(chartData, null, 2));
    console.log('Chart Config:', JSON.stringify(chartConfig, null, 2));
    console.log('First data item keys:', chartData[0] ? Object.keys(chartData[0]) : 'none');
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-zinc-800 rounded-2xl shadow-md border border-zinc-200 dark:border-zinc-700 p-3 sm:p-4">
      <div className="mb-3">
        <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Compare by Category
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category)}
              className={`px-2 py-1 text-xs rounded-full transition-colors cursor-pointer ${
                selectedCategory.key === category.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px]">
        {selectedCategory.key === 'all' || selectedCategory.key === 'ratios' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-zinc-700" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                interval={0}
              />
              <YAxis
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                width={35}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem', fontSize: '12px' }}
                labelStyle={{ color: '#f3f4f6' }}
                itemStyle={{ color: '#f3f4f6' }}
              />
              {foods.map((food, index) => (
                <Bar
                  key={`food${index}`}
                  dataKey={`food${index}`}
                  fill={foodColors[index % foodColors.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 10, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-zinc-700" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                width={35}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem', fontSize: '12px' }}
                labelStyle={{ color: '#f3f4f6' }}
                itemStyle={{ color: '#f3f4f6' }}
              />
              <Bar
                dataKey="value"
                fill={selectedCategory.color}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

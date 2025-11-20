'use client';

import { useState } from 'react';
import { FoodItem } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CategoryChartProps {
  foods: FoodItem[];
}

type Category = {
  key: keyof FoodItem['macros'] | 'totalFat';
  label: string;
  color: string;
  unit: string;
  getValue?: (food: FoodItem) => number;
};

const categories: Category[] = [
  { key: 'calories', label: 'Calories', color: '#f97316', unit: '' },
  { key: 'protein', label: 'Protein', color: '#3b82f6', unit: 'g' },
  {
    key: 'totalFat',
    label: 'Fat',
    color: '#10b981',
    unit: 'g',
    getValue: (food) => food.macros.unsaturatedFat + food.macros.saturatedFat
  },
  { key: 'saturatedFat', label: 'of which Saturates', color: '#ef4444', unit: 'g' },
  { key: 'carbs', label: 'Carbs', color: '#f59e0b', unit: 'g' },
  { key: 'sugars', label: 'of which Sugars', color: '#ec4899', unit: 'g' },
  { key: 'fibre', label: 'Fibre', color: '#8b5cf6', unit: 'g' },
];

export default function CategoryChart({ foods }: CategoryChartProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>(categories[0]);

  if (foods.length < 2) return null;

  const chartData = foods.map((food) => ({
    name: food.name,
    value: selectedCategory.getValue
      ? selectedCategory.getValue(food)
      : food.macros[selectedCategory.key as keyof FoodItem['macros']],
  }));

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-zinc-800 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-700 p-3 sm:p-4">
      <div className="mb-3">
        <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Compare by Category
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category)}
              className={`px-2 py-1 text-xs rounded-md transition-colors cursor-pointer ${
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

      <div className="[&_*]:outline-none [&_*]:focus:outline-none">
        <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} style={{ cursor: 'default' }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#9ca3af', fontSize: 10 }}
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
            formatter={(value) => [`${value}${selectedCategory.unit}`, selectedCategory.label]}
            cursor={false}
          />
          <Bar
            dataKey="value"
            fill={selectedCategory.color}
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
            activeBar={false}
          />
        </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { FoodItem } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CategoryChartProps {
  foods: FoodItem[];
}

type Category = {
  key: keyof FoodItem['macros'] | 'totalFat' | 'all';
  label: string;
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
  { key: 'saturatedFat', label: 'of which Saturates', color: '#ef4444', unit: 'g' },
  { key: 'carbs', label: 'Carbs', color: '#f59e0b', unit: 'g' },
  { key: 'sugars', label: 'of which Sugars', color: '#ec4899', unit: 'g' },
  { key: 'fibre', label: 'Fibre', color: '#8b5cf6', unit: 'g' },
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
  { key: 'saturatedFat', label: 'of which Saturates', color: '#ef4444', unit: 'g' },
  { key: 'carbs', label: 'Carbs', color: '#f59e0b', unit: 'g' },
  { key: 'sugars', label: 'of which Sugars', color: '#ec4899', unit: 'g' },
  { key: 'fibre', label: 'Fibre', color: '#8b5cf6', unit: 'g' },
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

  // Generate data for "All" view
  // Structure: One entry per macronutrient, with values for each food
  // X-axis will show macronutrient names (Calories, Protein, Fat, etc.)
  // Each macronutrient will have grouped bars (one per food)
  const getAllViewData = () => {
    return macroCategories.map((category) => {
      const entry: any = {
        name: category.label,
        unit: category.unit,
      };
      
      foods.forEach((food, index) => {
        const value = category.getValue
          ? category.getValue(food)
          : food.macros[category.key as keyof FoodItem['macros']];
        entry[food.name] = value;
      });
      
      return entry;
    });
  };

  const chartData = selectedCategory.key === 'all' 
    ? getAllViewData()
    : foods.map((food) => ({
        name: food.name,
        value: selectedCategory.getValue
          ? selectedCategory.getValue(food)
          : food.macros[selectedCategory.key as keyof FoodItem['macros']],
      }));

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

      <div className="[&_*]:outline-none [&_*]:focus:outline-none">
        <ResponsiveContainer width="100%" height={selectedCategory.key === 'all' ? 300 : 200}>
        <BarChart 
          data={chartData} 
          style={{ cursor: 'default' }}
          margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#9ca3af', fontSize: 10 }}
            angle={selectedCategory.key === 'all' ? 0 : -45}
            textAnchor={selectedCategory.key === 'all' ? 'middle' : 'end'}
            height={selectedCategory.key === 'all' ? 40 : 60}
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 10 }}
            width={35}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem', fontSize: '12px' }}
            labelStyle={{ color: '#f3f4f6' }}
            itemStyle={{ color: '#f3f4f6' }}
            formatter={(value: any, name: string, props: any) => {
              if (selectedCategory.key === 'all') {
                const payload = props?.payload;
                const unit = payload?.unit || '';
                return [`${value}${unit}`, name];
              }
              return [`${value}${selectedCategory.unit}`, selectedCategory.label];
            }}
            cursor={false}
          />
          {selectedCategory.key === 'all' ? (
            <>
              {foods.map((food, index) => (
                <Bar
                  key={food.name}
                  dataKey={food.name}
                  fill={foodColors[index % foodColors.length]}
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                  activeBar={false}
                />
              ))}
              <Legend
                wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                iconType="square"
                content={() => (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', paddingTop: '10px' }}>
                    {foods.map((food, index) => (
                      <div key={food.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px' }}>
                        <div style={{
                          width: '10px',
                          height: '10px',
                          backgroundColor: foodColors[index % foodColors.length],
                        }} />
                        <span>{food.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              />
            </>
          ) : (
            <Bar
              dataKey="value"
              fill={selectedCategory.color}
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
              activeBar={false}
            />
          )}
        </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

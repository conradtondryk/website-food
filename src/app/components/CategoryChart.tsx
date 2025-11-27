'use client';

import { useState } from 'react';
import { FoodItem } from '../types';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Customized } from 'recharts';

interface CategoryChartProps {
  foods: FoodItem[];
}

type Category = {
  key: keyof FoodItem['macros'] | 'totalFat' | 'all' | 'ratios';
  label: string;
  shortLabel?: string;
  unit: string;
  getValue?: (food: FoodItem) => number;
};

const categories: Category[] = [
  { key: 'all', label: 'all', unit: '' },
  { key: 'calories', label: 'calories', unit: '' },
  { key: 'protein', label: 'protein', unit: 'g' },
  { key: 'totalFat', label: 'fat', unit: 'g', getValue: (food) => food.macros.unsaturatedFat + food.macros.saturatedFat },
  { key: 'saturatedFat', label: 'saturates', shortLabel: 'sat', unit: 'g' },
  { key: 'carbs', label: 'carbs', unit: 'g' },
  { key: 'sugars', label: 'sugars', shortLabel: 'sug', unit: 'g' },
  { key: 'fibre', label: 'fibre', unit: 'g' },
  { key: 'ratios', label: 'ratios', unit: 'g/kcal' },
];

const macroCategories: Category[] = [
  { key: 'calories', label: 'cal', unit: '' },
  { key: 'protein', label: 'protein', unit: 'g' },
  { key: 'totalFat', label: 'fat', unit: 'g', getValue: (food) => food.macros.unsaturatedFat + food.macros.saturatedFat },
  { key: 'saturatedFat', label: 'sat', shortLabel: 'sat', unit: 'g' },
  { key: 'carbs', label: 'carbs', unit: 'g' },
  { key: 'sugars', label: 'sugar', shortLabel: 'sug', unit: 'g' },
  { key: 'fibre', label: 'fibre', unit: 'g' },
];

const ratioCategories: Category[] = [
  { key: 'protein', label: 'protein/kcal', shortLabel: 'prot', unit: 'g/kcal' },
  { key: 'totalFat', label: 'fat/kcal', shortLabel: 'fat', unit: 'g/kcal', getValue: (food) => food.macros.unsaturatedFat + food.macros.saturatedFat },
  { key: 'carbs', label: 'carbs/kcal', shortLabel: 'carb', unit: 'g/kcal' },
];

const foodColors = [
  '#3b82f6', // blue
  '#f97316', // orange
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
];

export default function CategoryChart({ foods }: CategoryChartProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>(categories[0]);

  if (foods.length < 2) return null;

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
        // Store actual value for tooltip and display
        entry[`food${index}_actual`] = value;
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
        const roundedRatio = Number(ratio.toFixed(4));

        // Store actual value for tooltip and display
        entry[`food${index}_actual`] = roundedRatio;
        entry[`food${index}`] = roundedRatio;
      });

      return entry;
    });
  };

  // Generate data for individual category view
  const getSingleCategoryViewData = () => {
    return foods.map((food) => {
      const actualValue = selectedCategory.getValue
        ? selectedCategory.getValue(food)
        : food.macros[selectedCategory.key as keyof FoodItem['macros']];

      return {
        name: food.name,
        value: actualValue,
      };
    });
  };

  const chartData = selectedCategory.key === 'all'
    ? getAllViewData()
    : selectedCategory.key === 'ratios'
    ? getRatiosViewData()
    : getSingleCategoryViewData();

  return (
    <div className="w-[calc(100vw-1.5rem)] sm:w-full max-w-full mx-auto bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4 overflow-hidden">
      <div className="mb-3">
        <div className="flex flex-wrap gap-1">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category)}
              className={`px-2 py-1 text-[10px] sm:text-xs rounded-md transition-colors cursor-pointer ${
                selectedCategory.key === category.key
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[200px] sm:h-[280px]">
        {selectedCategory.key === 'all' || selectedCategory.key === 'ratios' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 5, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#a1a1aa', fontSize: 8 }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={30}
                axisLine={{ stroke: '#e4e4e7' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#a1a1aa', fontSize: 8 }}
                width={30}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e4e4e7', borderRadius: '0.5rem', fontSize: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                labelStyle={{ color: '#18181b', fontWeight: 500 }}
                itemStyle={{ color: '#52525b' }}
                formatter={(_value: any, name: string, props: any) => {
                  const dataKey = props.dataKey;
                  const actualValue = props.payload[`${dataKey}_actual`];
                  return [actualValue, name];
                }}
              />
              {foods.map((food, index) => (
                <Bar
                  key={`food${index}`}
                  dataKey={`food${index}`}
                  name={food.name}
                  fill={foodColors[index % foodColors.length]}
                  radius={[3, 3, 0, 0]}
                />
              ))}
              <Customized
                component={(props: any) => {
                  const { formattedGraphicalItems } = props;
                  if (!formattedGraphicalItems || !formattedGraphicalItems[0]) return null;

                  const labels: any[] = [];
                  chartData.forEach((entry: any, entryIndex: number) => {
                    foods.forEach((_, foodIndex) => {
                      const actualValue = entry[`food${foodIndex}_actual`];
                      if (actualValue === 0) {
                        const barItem = formattedGraphicalItems.find((item: any) => item.props.dataKey === `food${foodIndex}`);
                        if (barItem && barItem.props.data[entryIndex]) {
                          const barData = barItem.props.data[entryIndex];
                          labels.push(
                            <text
                              key={`label-${entryIndex}-${foodIndex}`}
                              x={barData.x + barData.width / 2}
                              y={barData.y - 3}
                              fill="#d4d4d8"
                              textAnchor="middle"
                              fontSize={6}
                            >
                              0
                            </text>
                          );
                        }
                      }
                    });
                  });
                  return <g>{labels}</g>;
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '9px', paddingTop: '8px' }}
                iconType="circle"
                iconSize={6}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 5, left: -10, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#a1a1aa', fontSize: 8 }}
                interval={0}
                angle={-35}
                textAnchor="end"
                height={35}
                axisLine={{ stroke: '#e4e4e7' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#a1a1aa', fontSize: 8 }}
                width={30}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e4e4e7', borderRadius: '0.5rem', fontSize: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                labelStyle={{ color: '#18181b', fontWeight: 500 }}
                itemStyle={{ color: '#52525b' }}
              />
              <Bar
                dataKey="value"
                fill="#3b82f6"
                radius={[3, 3, 0, 0]}
              />
              <Customized
                component={(props: any) => {
                  const { formattedGraphicalItems } = props;
                  if (!formattedGraphicalItems || !formattedGraphicalItems[0]) return null;

                  const labels: any[] = [];
                  const barItem = formattedGraphicalItems[0];
                  if (barItem && barItem.props.data) {
                    barItem.props.data.forEach((barData: any, index: number) => {
                      if (barData.value === 0) {
                        labels.push(
                          <text
                            key={`label-${index}`}
                            x={barData.x + barData.width / 2}
                            y={barData.y - 3}
                            fill="#d4d4d8"
                            textAnchor="middle"
                            fontSize={7}
                          >
                            0
                          </text>
                        );
                      }
                    });
                  }
                  return <g>{labels}</g>;
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

import { NextResponse } from 'next/server';
import { foods, FoodCategory } from '../foods';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') as FoodCategory | null;

  if (!category) {
    // Return all categories with their food counts
    const categoryCounts: Record<string, number> = {};
    foods.forEach((food) => {
      if (food.category) {
        categoryCounts[food.category] = (categoryCounts[food.category] || 0) + 1;
      }
    });
    return NextResponse.json({ categories: categoryCounts });
  }

  // Return foods for a specific category
  const categoryFoods = foods
    .filter((food) => food.category === category)
    .map((food) => ({
      displayName: food.name,
      originalName: food.name,
    }));

  return NextResponse.json({ foods: categoryFoods });
}

import { NextRequest, NextResponse } from 'next/server';
import { foods } from './foods';
import { FoodItem } from '@/app/types';

export async function POST(request: NextRequest) {
  try {
    const { foodName } = await request.json();

    if (!foodName || typeof foodName !== 'string') {
      return NextResponse.json(
        { error: 'Food name is required' },
        { status: 400 }
      );
    }

    const normalizedName = foodName.trim().toLowerCase();

    // Find food in static list
    const food = foods.find(f => f.name.toLowerCase() === normalizedName);

    if (food) {
      // Always include 100g as the first option
      const defaultPortion = { amount: 1, unit: '100g', gramWeight: 100 };
      
      const otherPortions = food.portions?.map(p => ({
          amount: 1,
          unit: p.name,
          gramWeight: p.weight
      })) || [];

      const allPortions = [defaultPortion, ...otherPortions];

      const foodItem: FoodItem = {
        id: food.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: food.name,
        portionSize: '100g', // Default label
        portions: allPortions,
        macros: {
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          unsaturatedFat: food.fats,
          saturatedFat: 0, 
          sugars: 0,
          fibre: 0
        },
        source: 'ai'
      };
      return NextResponse.json(foodItem);
    }

    return NextResponse.json(
      { error: 'invalid_food' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching food data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch food data' },
      { status: 500 }
    );
  }
}

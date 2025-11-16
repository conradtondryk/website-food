import { NextRequest, NextResponse } from 'next/server';
import { getFoodByName, saveFoodToDatabase, mapDatabaseRowToFoodItem, searchFoodsInDatabase } from '@/lib/db';
import { searchUSDAFood } from '@/lib/usda';

export async function POST(request: NextRequest) {
  try {
    const { foodName, matchPortionSize } = await request.json();

    if (!foodName || typeof foodName !== 'string') {
      return NextResponse.json(
        { error: 'Food name is required' },
        { status: 400 }
      );
    }

    const normalizedName = foodName.trim().toLowerCase();

    const exactMatch = await getFoodByName(normalizedName);
    if (exactMatch && !matchPortionSize) {
      return NextResponse.json(mapDatabaseRowToFoodItem(exactMatch));
    }

    const dbMatches = await searchFoodsInDatabase(normalizedName);
    if (dbMatches && dbMatches.length > 0 && !matchPortionSize) {
      return NextResponse.json(mapDatabaseRowToFoodItem(dbMatches[0]));
    }

    if (!matchPortionSize) {
      const usdaFood = await searchUSDAFood(normalizedName);
      if (usdaFood) {
        try {
          await saveFoodToDatabase(usdaFood);
        } catch (error) {
          console.error('Error saving USDA food to database:', error);
        }
        return NextResponse.json(usdaFood);
      }
    }

    return NextResponse.json(
      { error: 'Food not found. Please try a different search.' },
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

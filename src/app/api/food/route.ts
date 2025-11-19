import { NextRequest, NextResponse } from 'next/server';
import { getFoodByName, mapDatabaseRowToFoodItem, searchFoodsInDatabase } from '@/lib/db';

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

    // Try exact match first
    const exactMatch = await getFoodByName(normalizedName);
    if (exactMatch) {
      return NextResponse.json(mapDatabaseRowToFoodItem(exactMatch));
    }

    // Try fuzzy search
    const dbMatches = await searchFoodsInDatabase(normalizedName);
    if (dbMatches && dbMatches.length > 0) {
      return NextResponse.json(mapDatabaseRowToFoodItem(dbMatches[0]));
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

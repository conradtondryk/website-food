import { NextRequest, NextResponse } from 'next/server';
import { searchFoodsInDatabase } from '@/lib/db';
import { formatFoodName } from '@/lib/format';

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

    // Query database for suggestions
    const results = await searchFoodsInDatabase(normalizedName);
    if (results && results.length > 0) {
      return NextResponse.json({
        suggestions: results.map(food => ({
          displayName: formatFoodName(food.name),
          originalName: food.name
        }))
      });
    }

    return NextResponse.json(
      { error: 'No suggestions found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}

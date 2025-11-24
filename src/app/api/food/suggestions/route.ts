import { NextRequest, NextResponse } from 'next/server';
import { foods } from '../foods';

export async function POST(request: NextRequest) {
  try {
    const { foodName } = await request.json();

    if (!foodName || typeof foodName !== 'string') {
      return NextResponse.json(
        { error: 'Food name is required' },
        { status: 400 }
      );
    }

    const normalizedInput = foodName.trim().toLowerCase();

    // Filter foods from the static list
    const results = foods.filter(food => 
      food.name.toLowerCase().includes(normalizedInput)
    );

    if (results.length > 0) {
      // Map to suggestion format
      const suggestions = results.slice(0, 5).map(food => ({
        displayName: food.name,
        originalName: food.name
      }));

      return NextResponse.json({
        suggestions
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

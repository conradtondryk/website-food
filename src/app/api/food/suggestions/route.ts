import { NextRequest, NextResponse } from 'next/server';
import { searchUSDAFoodSuggestions } from '@/lib/usda';

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

    // Query USDA for suggestions
    const usdaSuggestions = await searchUSDAFoodSuggestions(normalizedName);
    if (usdaSuggestions && usdaSuggestions.length > 0) {
      return NextResponse.json({
        suggestions: usdaSuggestions.map(s => ({ displayName: s.displayName, originalName: s.originalName }))
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

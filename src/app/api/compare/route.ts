import { NextRequest, NextResponse } from 'next/server';
import { FoodItem } from '@/app/types';

const COMPARISON_PROMPT = `you are a nutritional comparison expert. analyze the following foods and determine which is the healthiest overall option.

foods to compare:
{FOODS_JSON}

consider these factors:
- protein content (higher is better)
- fiber content (higher is better)
- saturated fat (lower is better)
- sugar content (lower is better)
- overall nutrient density
- health benefits vs concerns

respond with ONLY a JSON object in this exact format:
{
  "foodName": "name of winning food",
  "reason": "brief explanation (2-3 sentences) of why this food wins, focusing on specific nutritional advantages"
}

requirements:
- choose only ONE winner
- base decision on overall nutritional value
- explanation should be specific and mention actual nutritional metrics
- use lowercase for all text
- keep explanation concise but informative
- do not include any text outside the JSON object`;

export async function POST(request: NextRequest) {
  try {
    const { foods } = await request.json();

    if (!foods || !Array.isArray(foods) || foods.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 foods are required for comparison' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual AI API call to determine winner
    // const foodsJson = JSON.stringify(foods, null, 2);
    // const prompt = COMPARISON_PROMPT.replace('{FOODS_JSON}', foodsJson);
    // const response = await fetch('AI_API_ENDPOINT', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.AI_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     model: 'MODEL_NAME',
    //     messages: [{ role: 'user', content: prompt }],
    //     temperature: 0.3,
    //   }),
    // });
    // const data = await response.json();
    // const winner = JSON.parse(data.choices[0].message.content);

    // Mock response for now - pick a random food as winner
    const winnerFood = foods[Math.floor(Math.random() * foods.length)] as FoodItem;

    const mockWinner = {
      foodName: winnerFood.name,
      reason: `${winnerFood.name} has the best overall nutritional profile with higher protein and fiber content while maintaining lower saturated fat levels`,
    };

    return NextResponse.json(mockWinner);
  } catch (error) {
    console.error('Error comparing foods:', error);
    return NextResponse.json(
      { error: 'Failed to compare foods' },
      { status: 500 }
    );
  }
}

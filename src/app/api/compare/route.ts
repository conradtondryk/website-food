import { NextRequest, NextResponse } from 'next/server';
import { FoodItem } from '@/app/types';
import OpenAI from 'openai';

const xai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1',
});

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

    // Call Grok API
    const foodsJson = JSON.stringify(foods, null, 2);
    const prompt = COMPARISON_PROMPT.replace('{FOODS_JSON}', foodsJson);

    const completion = await xai.chat.completions.create({
      model: 'grok-4-fast',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('No response from Grok');
    }

    const winner = JSON.parse(responseText);

    return NextResponse.json(winner);
  } catch (error) {
    console.error('Error comparing foods:', error);
    return NextResponse.json(
      { error: 'Failed to compare foods' },
      { status: 500 }
    );
  }
}

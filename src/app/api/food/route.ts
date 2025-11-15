import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const xai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1',
});

const FOOD_DATA_PROMPT = `you are a nutritional analysis expert. analyze the following food item and provide accurate nutritional information.

food item: {FOOD_NAME}

respond with ONLY a JSON object in this exact format:
{
  "name": "food name",
  "macros": {
    "calories": number (kcal per 100g),
    "protein": number (grams per 100g),
    "unsaturatedFat": number (grams per 100g),
    "saturatedFat": number (grams per 100g),
    "carbs": number (grams per 100g),
    "sugars": number (grams per 100g),
    "fibre": number (grams per 100g)
  },
  "summary": {
    "pros": ["2-3 specific health benefits"],
    "cons": ["2-3 specific health concerns or limitations"]
  }
}

requirements:
- all values should be per 100g serving
- be accurate and use real nutritional data
- pros should highlight genuine nutritional benefits
- cons should mention realistic concerns (allergens, sugar content, etc)
- keep pros and cons concise (one sentence each)
- use lowercase for all text except numbers
- do not include any text outside the JSON object`;

export async function POST(request: NextRequest) {
  try {
    const { foodName } = await request.json();

    if (!foodName || typeof foodName !== 'string') {
      return NextResponse.json(
        { error: 'Food name is required' },
        { status: 400 }
      );
    }

    // Call Grok API
    const prompt = FOOD_DATA_PROMPT.replace('{FOOD_NAME}', foodName);
    const completion = await xai.chat.completions.create({
      model: 'grok-beta',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('No response from Grok');
    }

    const foodData = JSON.parse(responseText);

    return NextResponse.json(foodData);
  } catch (error) {
    console.error('Error fetching food data:', error);

    // Fallback to mock data if API fails
    const mockData = {
      name: foodName,
      macros: {
        calories: Math.floor(Math.random() * 500),
        protein: Math.floor(Math.random() * 50),
        unsaturatedFat: Math.floor(Math.random() * 20),
        saturatedFat: Math.floor(Math.random() * 10),
        carbs: Math.floor(Math.random() * 60),
        sugars: Math.floor(Math.random() * 30),
        fibre: Math.floor(Math.random() * 15),
      },
      summary: {
        pros: [
          'high in protein',
          'good source of vitamins',
        ],
        cons: [
          'may contain allergens',
          'high in sodium',
        ],
      },
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Error fetching food data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch food data' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const xai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1',
});

// Rate limiting for invalid food attempts
const invalidAttempts = new Map<string, { count: number; timestamp: number }>();
const MAX_INVALID_ATTEMPTS = 3;
const TIMEOUT_DURATION = 5 * 60 * 1000; // 5 minutes

function getClientId(request: NextRequest): string {
  return request.headers.get('x-forwarded-for') || 'unknown';
}

function checkRateLimit(clientId: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const attempt = invalidAttempts.get(clientId);

  if (attempt) {
    const timeSinceFirst = now - attempt.timestamp;

    if (timeSinceFirst > TIMEOUT_DURATION) {
      invalidAttempts.delete(clientId);
      return { allowed: true };
    }

    if (attempt.count >= MAX_INVALID_ATTEMPTS) {
      const remainingTime = Math.ceil((TIMEOUT_DURATION - timeSinceFirst) / 1000 / 60);
      return {
        allowed: false,
        message: `too many invalid attempts. please try again in ${remainingTime} minutes.`
      };
    }
  }

  return { allowed: true };
}

function recordInvalidAttempt(clientId: string) {
  const now = Date.now();
  const attempt = invalidAttempts.get(clientId);

  if (attempt && now - attempt.timestamp <= TIMEOUT_DURATION) {
    attempt.count += 1;
  } else {
    invalidAttempts.set(clientId, { count: 1, timestamp: now });
  }
}

const FOOD_DATA_PROMPT = `you are a nutritional analysis expert. analyze the following food item and provide accurate nutritional information.

food item: {FOOD_NAME}

IMPORTANT: if the input is NOT a valid food item (e.g., random words, objects, names, profanity, nonsense), respond with this exact JSON:
{
  "error": "invalid_food",
  "message": "please enter a valid food item"
}

otherwise, respond with ONLY a JSON object in this exact format:
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

    // Check rate limit
    const clientId = getClientId(request);
    const rateCheck = checkRateLimit(clientId);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'rate_limited', message: rateCheck.message },
        { status: 429 }
      );
    }

    // Call Grok API with streaming
    const prompt = FOOD_DATA_PROMPT.replace('{FOOD_NAME}', foodName);
    const stream = await xai.chat.completions.create({
      model: 'grok-4-fast',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      stream: true,
    });

    let fullResponse = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullResponse += content;
    }

    if (!fullResponse) {
      throw new Error('No response from Grok');
    }

    const foodData = JSON.parse(fullResponse);

    // Check if AI detected invalid food
    if (foodData.error === 'invalid_food') {
      recordInvalidAttempt(clientId);
      return NextResponse.json(
        { error: 'invalid_food', message: foodData.message },
        { status: 400 }
      );
    }

    return NextResponse.json(foodData);
  } catch (error) {
    console.error('Error fetching food data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch food data' },
      { status: 500 }
    );
  }
}

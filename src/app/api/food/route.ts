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
{PORTION_INSTRUCTION}

IMPORTANT: if the input is NOT a valid food item (e.g., random words, objects, names, profanity, nonsense), respond with this exact JSON:
{
  "error": "invalid_food",
  "message": "please enter a valid food item"
}

otherwise, respond with ONLY a JSON object in this exact format:
{
  "name": "food name",
  "portionSize": "the portion size for these macros (e.g., '100g', '1 cup', '1 medium')",
  "macros": {
    "calories": number (kcal per portion),
    "protein": number (grams per portion),
    "unsaturatedFat": number (grams per portion),
    "saturatedFat": number (grams per portion),
    "carbs": number (grams per portion),
    "sugars": number (grams per portion),
    "fibre": number (grams per portion)
  }
}

requirements:
- extract portion size from the food name if specified (e.g., "100g chicken", "1 cup rice")
- if no portion size specified, default to 100g
- all macro values should match the specified portion size
- be accurate and use real nutritional data
- use lowercase for all text except numbers
- do not include any text outside the JSON object`;

export async function POST(request: NextRequest) {
  try {
    const { foodName, matchPortionSize } = await request.json();

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
    const portionInstruction = matchPortionSize
      ? `\nIMPORTANT: provide nutritional data for exactly ${matchPortionSize} of this food, not per 100g.`
      : '';

    const prompt = FOOD_DATA_PROMPT
      .replace('{FOOD_NAME}', foodName)
      .replace('{PORTION_INSTRUCTION}', portionInstruction);
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

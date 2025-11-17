const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1';
const USDA_API_KEY = process.env.USDA_API_KEY || 'DEMO_KEY';

interface USDANutrient {
  nutrientId: number;
  nutrientName: string;
  value: number;
  unitName: string;
}

interface USDAFood {
  fdcId: number;
  description: string;
  foodNutrients: USDANutrient[];
  servingSize?: number;
  servingSizeUnit?: string;
}

interface USDASearchResult {
  foods: USDAFood[];
  totalHits: number;
}

export async function searchUSDAFood(query: string) {
  try {
    const response = await fetch(
      `${USDA_API_URL}/foods/search?query=${encodeURIComponent(query)}&pageSize=20&dataType=Survey (FNDDS)&api_key=${USDA_API_KEY}`
    );

    if (!response.ok) {
      return null;
    }

    const data: USDASearchResult = await response.json();

    if (!data.foods || data.foods.length === 0) {
      return null;
    }

    const queryLower = query.toLowerCase().trim();

    // Exact match
    const exactMatch = data.foods.find((f: any) =>
      f.description.toLowerCase() === queryLower ||
      f.description.toLowerCase() === `${queryLower}, raw` ||
      f.description.toLowerCase() === `${queryLower}, fresh`
    );

    // Match where query is complete word at start (e.g., "rice" matches "rice, white" but not "rice dressing")
    const exactWordMatch = data.foods.find((f: any) => {
      const desc = f.description.toLowerCase();
      return desc === queryLower || desc.startsWith(`${queryLower},`) || desc.startsWith(`${queryLower} `);
    });

    // Raw food that starts with exact query word
    const rawFood = data.foods.find((f: any) => {
      const desc = f.description.toLowerCase();
      return (desc === queryLower || desc.startsWith(`${queryLower},`) || desc.startsWith(`${queryLower} `)) &&
        desc.includes('raw');
    });

    // Fresh food that starts with exact query word
    const freshFood = data.foods.find((f: any) => {
      const desc = f.description.toLowerCase();
      return (desc === queryLower || desc.startsWith(`${queryLower},`) || desc.startsWith(`${queryLower} `)) &&
        desc.includes('fresh');
    });

    // Fallback: any match that starts with query
    const startsWithMatch = data.foods.find((f: any) =>
      f.description.toLowerCase().startsWith(queryLower)
    );

    const food = exactMatch || rawFood || freshFood || exactWordMatch || startsWithMatch || data.foods[0];
    return mapUSDAToFoodData(food);
  } catch (error) {
    console.error('Error fetching from USDA:', error);
    return null;
  }
}

function mapUSDAToFoodData(usdaFood: USDAFood) {
  const nutrients = usdaFood.foodNutrients;

  const getNutrientValue = (nutrientIds: number[]): number => {
    for (const id of nutrientIds) {
      const nutrient = nutrients.find((n) => n.nutrientId === id);
      if (nutrient) {
        return Number(nutrient.value) || 0;
      }
    }
    return 0;
  };

  const servingSize = usdaFood.servingSize || 100;
  const scaleFactor = 100 / servingSize;

  const calories = getNutrientValue([1008]) * scaleFactor;
  const protein = getNutrientValue([1003]) * scaleFactor;
  const totalFat = getNutrientValue([1004]) * scaleFactor;
  const saturatedFat = getNutrientValue([1258]) * scaleFactor;
  const unsaturatedFat = Math.max(0, totalFat - saturatedFat);
  const carbs = getNutrientValue([1005]) * scaleFactor;
  const sugars = getNutrientValue([2000]) * scaleFactor;
  const fibre = getNutrientValue([1079]) * scaleFactor;

  const formatName = (description: string): string => {
    const lower = description.toLowerCase();
    const parts = lower.split(',').map(p => p.trim());

    if (parts.length === 2 && (parts[1] === 'raw' || parts[1] === 'fresh')) {
      return `${parts[0]} (${parts[1]})`;
    }

    return lower;
  };

  return {
    name: formatName(usdaFood.description),
    portionSize: '100g',
    macros: {
      calories: Math.round(calories),
      protein: Number(protein.toFixed(2)),
      unsaturatedFat: Number(unsaturatedFat.toFixed(2)),
      saturatedFat: Number(saturatedFat.toFixed(2)),
      carbs: Number(carbs.toFixed(2)),
      sugars: Number(sugars.toFixed(2)),
      fibre: Number(fibre.toFixed(2)),
    },
    source: 'usda',
    sourceUrl: `https://fdc.nal.usda.gov/fdc-app.html#/food-details/${usdaFood.fdcId}/nutrients`,
  };
}

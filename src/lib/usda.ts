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

export async function searchUSDAFoodSuggestions(query: string): Promise<Array<{ displayName: string; originalName: string }>> {
  try {
    const response = await fetch(
      `${USDA_API_URL}/foods/search?query=${encodeURIComponent(query)}&pageSize=50&dataType=Survey (FNDDS)&api_key=${USDA_API_KEY}`
    );

    if (!response.ok) {
      return [];
    }

    const data: USDASearchResult = await response.json();

    if (!data.foods || data.foods.length === 0) {
      return [];
    }

    const queryLower = query.toLowerCase().trim();

    const cleanName = (description: string): string => {
      let name = description.toLowerCase();

      // Remove all "ns" (not specified) qualifiers
      name = name.replace(/, nfs$/g, '');
      name = name.replace(/, ns as to [^,]+/g, '');
      name = name.replace(/, as ingredient$/g, '');

      // Simplify cooking methods
      name = name.replace(/, cooked/g, '');
      name = name.replace(/, raw/g, ' (raw)');
      name = name.replace(/, fresh/g, ' (fresh)');

      // For items starting with the query, rearrange to be more natural
      if (name.startsWith(`${queryLower},`)) {
        const parts = name.split(',').map(p => p.trim());
        if (parts.length >= 2 && parts[1].length < 20 && !parts[1].includes(' ')) {
          // "rice, white" -> "white rice"
          name = `${parts[1]} ${parts[0]}`;
        } else {
          // Just remove the first comma for complex descriptions
          name = name.replace(`${queryLower}, `, `${queryLower} `);
        }
      }

      return name.trim();
    };

    // Score each result by relevance
    const scored = data.foods.map((f: any) => {
      const desc = f.description.toLowerCase();
      let score = 0;

      // Skip compound foods (sauce, dressing, etc) unless exact match
      const compoundFoodWords = ['sauce', 'dressing', 'soup', 'salad', 'sandwich', 'burger', 'pizza', 'cake', 'pie', 'cookie', 'bread', 'cracker', 'chip'];
      const isCompoundFood = compoundFoodWords.some(word => {
        const regex = new RegExp(`^${queryLower}\\s+${word}\\b`, 'i');
        return regex.test(desc);
      });

      if (isCompoundFood && desc !== queryLower) {
        score -= 500; // Heavy penalty for compound foods
      }

      // Filter out overly specific items that users rarely want
      const unwantedModifiers = ['with gravy', 'with sauce', 'with butter', 'made with', 'ns as to', 'mixture', 'baby food', 'infant', 'formula', 'from fast food', 'from restaurant'];
      const hasUnwantedModifier = unwantedModifiers.some(mod => desc.includes(mod));
      if (hasUnwantedModifier) {
        score -= 300;
      }

      // Filter out specific anatomical parts that users rarely search for
      const anatomicalParts = ['back', 'tail', 'neck', 'gizzard', 'giblets', 'liver', 'heart', 'kidney', 'tongue', 'feet', 'head', 'wing', 'thigh', 'drumstick'];
      const hasAnatomicalPart = anatomicalParts.some(part =>
        desc.includes(`${part} ${queryLower}`) ||
        desc.includes(`${queryLower} ${part}`) ||
        desc.includes(`${queryLower}, ${part}`) ||
        desc.includes(`, ${part},`)
      );
      if (hasAnatomicalPart) {
        score -= 250;
      }

      // Penalize duplicate words (like "chicken chicken")
      const words = desc.split(/[\s,]+/);
      const hasDuplicates = words.length !== new Set(words).size;
      if (hasDuplicates) {
        score -= 200;
      }

      // Boost common cooking methods people actually want
      const preferredMethods = ['fried', 'baked', 'grilled', 'roasted', 'broiled', 'boiled', 'steamed', 'cooked'];
      const hasPreferredMethod = preferredMethods.some(method => desc.includes(`, ${method}`));
      if (hasPreferredMethod) {
        score += 50;
      }

      // Exact match gets highest score
      if (desc === queryLower) score += 1000;

      // Starts with query
      if (desc.startsWith(`${queryLower},`)) score += 100;
      if (desc.startsWith(`${queryLower} `)) score += 90;

      // Contains query in comma-separated part
      if (desc.includes(`, ${queryLower},`)) score += 80;

      // Shorter names are generally better (less specific)
      score -= desc.length * 0.1;

      // Penalize overly specific items
      if (desc.includes('with ')) score -= 20;
      if (desc.includes('made with')) score -= 30;
      if (desc.includes('flavored')) score -= 15;

      return { food: f, score, cleanedName: cleanName(f.description), originalName: f.description };
    });

    // Sort by score and remove duplicates
    scored.sort((a, b) => b.score - a.score);

    const seen = new Set<string>();
    const unique = scored.filter(item => {
      if (seen.has(item.cleanedName)) return false;
      seen.add(item.cleanedName);
      return true;
    });

    return unique.slice(0, 5).map(item => ({ displayName: item.cleanedName, originalName: item.originalName }));
  } catch (error) {
    console.error('Error fetching USDA suggestions:', error);
    return [];
  }
}

export async function searchUSDAFood(query: string) {
  try {
    const response = await fetch(
      `${USDA_API_URL}/foods/search?query=${encodeURIComponent(query)}&pageSize=20&dataType=Survey (FNDDS)&api_key=${USDA_API_KEY}`
    );

    if (!response.ok) {
      console.log(`[searchUSDAFood] Response not OK: ${response.status}`);
      return null;
    }

    const data: USDASearchResult = await response.json();

    if (!data.foods || data.foods.length === 0) {
      console.log(`[searchUSDAFood] No foods returned for: ${query}`);
      return null;
    }

    console.log(`[searchUSDAFood] Found ${data.foods.length} results for: ${query}`);

    const queryLower = query.toLowerCase().trim();

    // Exact match
    const exactMatch = data.foods.find((f: any) =>
      f.description.toLowerCase() === queryLower ||
      f.description.toLowerCase() === `${queryLower}, raw` ||
      f.description.toLowerCase() === `${queryLower}, fresh`
    );

    // Match with comma (descriptors like "rice, white" or "steak, raw")
    const commaMatch = data.foods.find((f: any) => {
      const desc = f.description.toLowerCase();
      return desc.startsWith(`${queryLower},`);
    });

    // Raw food with comma
    const rawFood = data.foods.find((f: any) => {
      const desc = f.description.toLowerCase();
      return desc.startsWith(`${queryLower},`) && desc.includes('raw');
    });

    // Fresh food with comma
    const freshFood = data.foods.find((f: any) => {
      const desc = f.description.toLowerCase();
      return desc.startsWith(`${queryLower},`) && desc.includes('fresh');
    });

    // Match with space (less preferred, might be compound like "steak sauce")
    const spaceMatch = data.foods.find((f: any) => {
      const desc = f.description.toLowerCase();
      return desc.startsWith(`${queryLower} `);
    });

    // Fallback: any match that starts with query
    const startsWithMatch = data.foods.find((f: any) =>
      f.description.toLowerCase().startsWith(queryLower)
    );

    const food = exactMatch || rawFood || freshFood || commaMatch || spaceMatch || startsWithMatch || data.foods[0];
    console.log(`[searchUSDAFood] Selected food: ${food.description}`);
    const result = mapUSDAToFoodData(food);
    console.log(`[searchUSDAFood] Mapped result:`, result ? result.name : 'NULL');
    return result;
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
    let name = description.toLowerCase();

    // Remove all "ns" (not specified) qualifiers
    name = name.replace(/, nfs$/g, '');
    name = name.replace(/, ns as to [^,]+/g, '');
    name = name.replace(/, as ingredient$/g, '');

    // Simplify cooking methods
    name = name.replace(/, cooked/g, '');
    name = name.replace(/, raw/g, ' (raw)');
    name = name.replace(/, fresh/g, ' (fresh)');

    // For items with comma, rearrange to be more natural
    const parts = name.split(',').map(p => p.trim());
    if (parts.length >= 2 && parts[1].length < 20 && !parts[1].includes(' ')) {
      // "rice, white" -> "white rice"
      name = `${parts[1]} ${parts[0]}`;
    }

    return name.trim();
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
    source: 'usda' as const,
    sourceUrl: `https://fdc.nal.usda.gov/fdc-app.html#/food-details/${usdaFood.fdcId}/nutrients`,
  };
}

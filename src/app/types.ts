export interface FoodMacros {
  calories: number;
  protein: number;
  unsaturatedFat: number;
  saturatedFat: number;
  carbs: number;
  sugars: number;
  fibre: number;
}

export interface FoodPortion {
  amount: number; // e.g. 1
  unit: string;   // e.g. "cup", "fillet", "fruit"
  gramWeight: number;
}

export interface FoodItem {
  id: string; // Unique identifier for React keys
  name: string;
  portionSize: string;
  portions?: FoodPortion[];
  macros: FoodMacros;
  source: 'usda' | 'ai';
  sourceUrl?: string;
  price?: number; // Price per 100g
}

export interface Winner {
  foodName: string;
  reason: string;
}

export interface FoodMacros {
  calories: number;
  protein: number;
  unsaturatedFat: number;
  saturatedFat: number;
  carbs: number;
  sugars: number;
  fibre: number;
}

export interface FoodItem {
  name: string;
  portionSize: string;
  macros: FoodMacros;
  source: 'usda' | 'ai';
  sourceUrl?: string;
  price?: number; // Price per 100g
}

export interface Winner {
  foodName: string;
  reason: string;
}

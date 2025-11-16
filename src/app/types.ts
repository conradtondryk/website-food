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
  portionSize: string; // e.g., "100g", "1 cup", "1 medium"
  macros: FoodMacros;
}

export interface Winner {
  foodName: string;
  reason: string;
}

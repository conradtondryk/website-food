export interface FoodMacros {
  calories: number;
  protein: number;
  unsaturatedFat: number;
  saturatedFat: number;
  carbs: number;
  sugars: number;
  fibre: number;
}

export interface FoodSummary {
  pros: string[];
  cons: string[];
}

export interface FoodItem {
  name: string;
  macros: FoodMacros;
  summary: FoodSummary;
}

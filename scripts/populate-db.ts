import { config } from 'dotenv';
import { searchUSDAFood } from '../src/lib/usda';
import { saveFoodToDatabase } from '../src/lib/db';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Core fundamental foods that people commonly search for
const FUNDAMENTAL_FOODS = [
  // Proteins
  'chicken breast',
  'chicken thigh',
  'fried chicken',
  'grilled chicken',
  'baked chicken',
  'ground beef',
  'steak',
  'pork chop',
  'bacon',
  'salmon',
  'tuna',
  'shrimp',
  'eggs',
  'egg whites',
  'tofu',

  // Carbs
  'white rice',
  'brown rice',
  'boiled rice',
  'pasta',
  'spaghetti',
  'bread',
  'white bread',
  'whole wheat bread',
  'potato',
  'baked potato',
  'french fries',
  'sweet potato',
  'oatmeal',
  'quinoa',

  // Vegetables
  'broccoli',
  'spinach',
  'carrots',
  'tomato',
  'lettuce',
  'cucumber',
  'bell pepper',
  'onion',
  'garlic',
  'green beans',
  'cauliflower',
  'asparagus',

  // Fruits
  'banana',
  'apple',
  'orange',
  'strawberries',
  'blueberries',
  'grapes',
  'watermelon',
  'mango',
  'pineapple',
  'avocado',

  // Dairy
  'milk',
  'skim milk',
  'whole milk',
  'yogurt',
  'greek yogurt',
  'cheese',
  'cheddar cheese',
  'mozzarella cheese',
  'cottage cheese',
  'butter',

  // Nuts & Seeds
  'almonds',
  'peanuts',
  'peanut butter',
  'walnuts',
  'cashews',
  'chia seeds',
  'flax seeds',

  // Common prepared foods
  'pizza',
  'burger',
  'sandwich',
  'burrito',
  'taco',
  'salad',
];

async function populateDatabase() {
  console.log(`Starting to populate database with ${FUNDAMENTAL_FOODS.length} fundamental foods...\n`);

  let successCount = 0;
  let failCount = 0;

  for (const foodName of FUNDAMENTAL_FOODS) {
    try {
      console.log(`Fetching: ${foodName}...`);

      // Use searchUSDAFood which internally gets the best match
      const foodData = await searchUSDAFood(foodName);

      if (foodData) {
        await saveFoodToDatabase(foodData);
        console.log(`✓ Saved: ${foodData.name}`);
        successCount++;
      } else {
        console.log(`✗ Not found: ${foodName}`);
        failCount++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`✗ Error with ${foodName}:`, error);
      failCount++;
    }
  }

  console.log(`\n=== Complete ===`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
}

populateDatabase().catch(console.error);

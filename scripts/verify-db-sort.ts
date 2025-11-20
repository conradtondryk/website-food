import { config } from 'dotenv';
import { searchFoodsInDatabase } from '../src/lib/db';

config({ path: '.env.local' });

async function run() {
  console.log("Searching for 'egg'...");
  const results = await searchFoodsInDatabase('egg');
  console.log("Top 5 Results:");
  results.slice(0, 5).forEach((r, i) => {
    console.log(`${i + 1}. ${r.name} (${r.calories} cal)`);
  });
}

run().catch(console.error);


import { config } from 'dotenv';
config({ path: '/Users/conradtondryk/code/website-food/.env.local' });

const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1';
const USDA_API_KEY = process.env.USDA_API_KEY || 'DEMO_KEY';

async function testSearch(query: string) {
  console.log(`\nTesting: ${query}`);
  console.log(`API Key present: ${!!USDA_API_KEY}`);

  const url = `${USDA_API_URL}/foods/search?query=${encodeURIComponent(query)}&pageSize=20&dataType=Survey (FNDDS)&api_key=${USDA_API_KEY}`;
  console.log(`URL (truncated): ${url.substring(0, 100)}...`);

  const response = await fetch(url);
  console.log(`Response status: ${response.status} ${response.statusText}`);
  console.log(`Response ok: ${response.ok}`);

  if (!response.ok) {
    const text = await response.text();
    console.log(`Error response: ${text.substring(0, 200)}`);
    return;
  }

  const data = await response.json();
  console.log(`Total hits: ${data.totalHits}`);
  console.log(`Foods returned: ${data.foods?.length || 0}`);
  if (data.foods && data.foods.length > 0) {
    console.log(`First food: ${data.foods[0].description}`);
  }
}

testSearch('chicken breast').catch(console.error);

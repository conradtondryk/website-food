import * as XLSX from 'xlsx';

const filePath = '/Users/conradtondryk/Downloads/MyFoodData-Nutrition-Facts.xlsx';

console.log('Reading Excel file...');
const workbook = XLSX.readFile(filePath);

console.log('\nSheet names:', workbook.SheetNames);

// Get first sheet
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convert to JSON - skip first 3 header rows
const data = XLSX.utils.sheet_to_json(sheet, { range: 3 });

console.log(`\nTotal rows: ${data.length}`);
if (data.length > 0) {
  console.log('\nFirst row columns:');
  console.log(Object.keys(data[0] as Record<string, any>));
}

console.log('\nFirst 3 data rows:');
console.log(data.slice(0, 3));

// Search for salmon
console.log('\n\nSearching for salmon foods...');
const salmonFoods = data.filter((row: any) =>
  row.name?.toLowerCase().includes('salmon')
).slice(0, 10);

console.log(`Found ${salmonFoods.length} salmon foods (showing first 10):`);
salmonFoods.forEach((food: any) => {
  console.log(`\n${food.name}`);
  console.log(`  Calories: ${food.Calories}`);
  console.log(`  Protein: ${food['Protein (g)']}`);
  console.log(`  Fat: ${food['Fat (g)']}`);
  console.log(`  Saturated Fat: ${food['Saturated Fats (g)']}`);
  console.log(`  Carbs: ${food['Carbohydrate (g)']}`);
  console.log(`  Sugars: ${food['Sugars (g)']}`);
  console.log(`  Fiber: ${food['Fiber (g)']}`);
});

// Search for chicken
console.log('\n\nSearching for cooked chicken foods...');
const chickenFoods = data.filter((row: any) => {
  const desc = row.name?.toLowerCase() || '';
  return desc.includes('chicken') && (desc.includes('cooked') || desc.includes('roasted') || desc.includes('grilled'));
}).slice(0, 10);

console.log(`Found ${chickenFoods.length} cooked chicken foods (showing first 10):`);
chickenFoods.forEach((food: any) => {
  console.log(`\n${food.name}`);
  console.log(`  Calories: ${food.Calories}`);
  console.log(`  Protein: ${food['Protein (g)']}`);
  console.log(`  Fat: ${food['Fat (g)']}`);
  console.log(`  Saturated Fat: ${food['Saturated Fats (g)']}`);
  console.log(`  Carbs: ${food['Carbohydrate (g)']}`);
  console.log(`  Sugars: ${food['Sugars (g)']}`);
  console.log(`  Fiber: ${food['Fiber (g)']}`);
});

import { createReadStream } from 'fs';
import csv from 'csv-parser';

const DATA_DIR = '/tmp/FoodData_Central_foundation_food_csv_2024-10-31';

async function debug() {
    const sampleFoods: any[] = [];
    const nutrients: any[] = [];
    
    console.log('Reading foundation_food.csv...');
    await new Promise((resolve) => {
        createReadStream(`${DATA_DIR}/foundation_food.csv`)
            .pipe(csv())
            .on('data', (d) => { if (sampleFoods.length < 5) sampleFoods.push(d); })
            .on('end', resolve);
    });
    console.log('Foundation Foods IDs:', sampleFoods.map(f => `"${f.fdc_id}"`));

    console.log('Reading food.csv...');
    await new Promise((resolve) => {
        createReadStream(`${DATA_DIR}/food.csv`)
            .pipe(csv())
            .on('data', (d) => { 
                if (sampleFoods.some(s => s.fdc_id === d.fdc_id)) {
                    // console.log('Found food match!', d.fdc_id);
                }
            })
            .on('end', resolve);
    });
    
    console.log('Reading food_nutrient.csv (first 1000 rows)...');
    let count = 0;
    await new Promise((resolve) => {
        const stream = createReadStream(`${DATA_DIR}/food_nutrient.csv`).pipe(csv());
        stream.on('data', (d) => { 
            count++;
            if (count > 1000) { stream.destroy(); resolve(null); return; }
            if (sampleFoods.some(s => s.fdc_id === d.fdc_id)) {
                console.log('Found nutrient match!', d.fdc_id);
            }
        })
        .on('end', resolve);
    });
}

debug();


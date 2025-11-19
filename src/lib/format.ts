export function formatFoodName(name: string): string {
  let formatted = name;

  // Remove common technical suffixes and descriptors (both at end and in middle)
  formatted = formatted
    .replace(/, raw(,|$)/gi, '$1')
    .replace(/, unprepared(,|$)/gi, '$1')
    .replace(/, refrigerated(,|$)/gi, '$1')
    .replace(/, frozen(,|$)/gi, '$1')
    .replace(/, pasteurized(,|$)/gi, '$1')
    .replace(/, dried(,|$)/gi, '$1')
    .replace(/, dry(,|$)/gi, '$1')
    .replace(/, peeled(,|$)/gi, '$1')
    .replace(/, with added vitamin [a-z](\s?and vitamin [a-z])?(,|$)/gi, '$2')
    .replace(/, with salt added(,|$)/gi, '$1')
    .replace(/, without salt added(,|$)/gi, '$1')
    .replace(/, drained solids(,|$)/gi, '$1')
    .replace(/, ready-to-serve(,|$)/gi, '$1')
    .replace(/, unenriched(,|$)/gi, '$1');

  // Clean up redundant phrases
  formatted = formatted
    .replace(/broilers? or fryers?,?\s*/gi, '')
    .replace(/meat only,?\s*/gi, '')
    .replace(/boneless,?\s*/gi, '')
    .replace(/skinless,?\s*/gi, '');

  // Rearrange common patterns to be more natural
  // "chicken, breast, boneless, skinless, raw" -> "chicken breast"
  // "milk, whole, 3.25% milkfat, with added vitamin d" -> "whole milk"

  // Handle "food, descriptor" pattern
  const commaPattern = /^([^,]+),\s*(.+)$/;
  const match = formatted.match(commaPattern);

  if (match) {
    const [, base, descriptors] = match;
    const descList = descriptors.split(',').map(d => d.trim());

    // For milk/yogurt/cheese, put descriptor first
    if (base.match(/^(milk|yogurt|cheese)$/i)) {
      const mainDesc = descList[0];
      formatted = `${mainDesc} ${base}`;
    }
    // For eggs, keep it simple: "egg, yolk" -> "Egg yolk"
    else if (base.match(/^egg$/i)) {
      const eggParts = descList.filter(d =>
        d.match(/^(yolk|white|whole)$/i)
      );
      if (eggParts.length > 0) {
        formatted = eggParts[0] === 'whole' ? base : `${base} ${eggParts[0]}`;
      } else {
        formatted = base;
      }
    }
    // For fish, use the fish type as the main name
    else if (base.match(/^fish$/i)) {
      const fishTypes = descList.filter(d =>
        d.match(/^(salmon|tuna|cod|halibut|tilapia|trout|mackerel|sardine)$/i)
      );
      if (fishTypes.length > 0) {
        formatted = fishTypes[0];
      } else {
        formatted = base;
      }
    }
    // For meats, keep simple descriptors
    else if (base.match(/^(chicken|beef|pork|turkey)$/i)) {
      const importantDescs = descList.filter(d =>
        d.match(/^(breast|thigh|drumstick|wing|ground|steak|loin|tenderloin|ribeye|chuck|flank)$/i)
      );
      if (importantDescs.length > 0) {
        formatted = `${base} ${importantDescs[0]}`;
      } else {
        formatted = base;
      }
    }
    // For nuts, use the nut type as the main name
    else if (base.match(/^nuts$/i)) {
      // "nuts, almonds" -> "Almond"
      const nutTypes = descList.filter(d =>
        d.match(/^(almond|peanut|walnut|cashew|pecan|pistachio|hazelnut|macadamia)s?$/i)
      );
      if (nutTypes.length > 0) {
        // Singularize if needed
        let nutType = nutTypes[0];
        if (nutType.match(/s$/i) && !nutType.match(/ss$/i)) {
          nutType = nutType.replace(/s$/i, '');
        }
        formatted = nutType;
      } else {
        formatted = base;
      }
    }
    // For flour, put type first: "flour, almond" -> "Almond flour"
    else if (base.match(/^flour$/i)) {
      const flourTypes = descList.filter(d =>
        d.match(/^(almond|oat|wheat|rye|coconut|rice|potato|bread|white|whole|all-purpose)$/i)
      );
      if (flourTypes.length > 0) {
        formatted = `${flourTypes[0]} ${base}`;
      } else {
        formatted = base;
      }
    }
    // For processed/prepared foods, keep first meaningful descriptor
    else if (base.match(/^(cookies?|sausages?|bread|tortillas?)$/i)) {
      const meaningfulDescs = descList.filter(d =>
        d.match(/^(oatmeal|chocolate chip|italian|white|whole-wheat|whole grain|corn|flour)$/i)
      );
      if (meaningfulDescs.length > 0) {
        formatted = `${meaningfulDescs[0]} ${base}`;
      } else {
        formatted = base;
      }
    }
    // For most other foods (fruits, vegetables, grains), simplify by using just the base
    // Convert plurals to singular for cleaner display
    else {
      // Convert plurals to singular
      let singularBase = base;
      if (singularBase.match(/ies$/i)) {
        singularBase = singularBase.replace(/ies$/i, 'y');
      } else if (singularBase.match(/oes$/i)) {
        singularBase = singularBase.replace(/oes$/i, 'o');
      } else if (singularBase.match(/s$/i) && !singularBase.match(/(ss|rice|oats)$/i)) {
        singularBase = singularBase.replace(/s$/i, '');
      }

      // For fruits/vegetables with variety descriptors, keep only meaningful ones
      const meaningfulDescs = descList.filter(d =>
        d.match(/^(hass|fuji|gala|honeycrisp|granny smith|red|green|yellow|orange|black|white|wild|long grain|short grain|basmati|jasmine)$/i)
      );

      if (meaningfulDescs.length > 0) {
        formatted = `${meaningfulDescs[0]} ${singularBase}`;
      } else {
        formatted = singularBase;
      }
    }
  }

  // If no comma pattern matched, still singularize simple plural foods
  if (!match || formatted === name.charAt(0).toUpperCase() + name.slice(1)) {
    // Singularize common plural foods
    if (formatted.match(/ies$/i)) {
      formatted = formatted.replace(/ies$/i, 'y');
    } else if (formatted.match(/oes$/i)) {
      formatted = formatted.replace(/oes$/i, 'o');
    } else if (formatted.match(/s$/i) && !formatted.match(/(ss|rice|oats|lentils|peas)$/i)) {
      formatted = formatted.replace(/s$/i, '');
    }
  }

  // Capitalize first letter
  formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);

  // Clean up extra spaces
  formatted = formatted.replace(/\s+/g, ' ').trim();

  return formatted;
}

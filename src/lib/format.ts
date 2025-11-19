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
    .replace(/, with added vitamin [a-z](\s?and vitamin [a-z])?(,|$)/gi, '$2')
    .replace(/, with salt added(,|$)/gi, '$1')
    .replace(/, without salt added(,|$)/gi, '$1')
    .replace(/, drained solids(,|$)/gi, '$1')
    .replace(/, ready-to-serve(,|$)/gi, '$1');

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
    // For nuts, just use base + first descriptor
    else if (base.match(/^nuts,/i)) {
      formatted = `${descList[0]} ${base.replace(/^nuts,\s*/i, '')}`;
    }
  }

  // Capitalize first letter
  formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);

  // Clean up extra spaces
  formatted = formatted.replace(/\s+/g, ' ').trim();

  return formatted;
}

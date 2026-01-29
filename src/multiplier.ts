// src/utils/ingredientQuantity.ts

// Map for common unicode vulgar fractions to numeric values
const VULGAR_FRACTIONS: Record<string, number> = {
  "¼": 1 / 4,
  "½": 1 / 2,
  "¾": 3 / 4,
  "⅐": 1 / 7,
  "⅑": 1 / 9,
  "⅒": 1 / 10,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "⅕": 1 / 5,
  "⅖": 2 / 5,
  "⅗": 3 / 5,
  "⅘": 4 / 5,
  "⅙": 1 / 6,
  "⅚": 5 / 6,
  "⅛": 1 / 8,
  "⅜": 3 / 8,
  "⅝": 5 / 8,
  "⅞": 7 / 8,
};

// Fractions we can format back to (for prettier outputs)
const COMMON_FRACTIONS: Array<[number, string]> = [
  [1 / 8, "⅛"], [1 / 6, "⅙"], [1 / 5, "⅕"], [1 / 4, "¼"], [1 / 3, "⅓"], [3 / 8, "⅜"],
  [1 / 2, "½"], [5 / 8, "⅝"], [2 / 3, "⅔"], [3 / 4, "¾"], [4 / 5, "⅘"], [5 / 6, "⅚"], [7 / 8, "⅞"],
];

export type IngredientMultiplierOptions = {
  formatAsFraction?: boolean;     // default: true
  fractionTolerance?: number;     // default: 1e-3
  maxDecimals?: number;           // default: 2
};

/** Normalize HTML entities & unicode fraction variants */
function normalizeQuantityString(text: string): string {
  // 1) Decode common HTML entities if present
  // Minimal inline decoder for typical fraction entities
  const htmlDecoded = text
    .replace(/&frac12;|&#189;|&#x00BD;/gi, "½")
    .replace(/&frac14;|&#188;|&#x00BC;/gi, "¼")
    .replace(/&frac34;|&#190;|&#x00BE;/gi, "¾")
    .replace(/&frac13;|&#8531;|&#x2153;/gi, "⅓")
    .replace(/&frac23;|&#8532;|&#x2154;/gi, "⅔");

  // 2) Convert superscript digits and unicode fraction slash to normal ones
  // superscripts: ⁰¹²³⁴⁵⁶⁷⁸⁹ and ⁄ (U+2044)
  const superscriptMap: Record<string, string> = {
    "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
    "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁄": "/",
  };
  const normalized = htmlDecoded.replace(/[⁰-⁹⁄]/g, (ch) => superscriptMap[ch] ?? ch);

  // Optional: Unicode normalization form C (helps if input comes in NFD)
  return normalized.normalize("NFC");
}

// Helper: parse a quantity string into a number
export function parseQuantity(token: string): number | null {
  const trimmed = normalizeQuantityString(token.trim());

  // Mixed number like "1 1/2" or "2½"
  const mixedA = /^(\d+)\s+(\d+\/\d+|[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])$/;
  const mixedB = /^(\d+)([¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])$/;

  // Slash fraction like "1/3", "3/4" — after normalization also covers 1⁄2 -> 1/2
  const slash = /^(\d+)\s*\/\s*(\d+)$/;

  // Decimal like "2.5" or "2,5" (comma accepted)
  const decimal = /^(\d+([.,]\d+)?)$/;

  // 1) Mixed number A: "1 1/2"
  let m = trimmed.match(mixedA);
  if (m) {
    const whole = parseInt(m[1], 10);
    const frac = m[2];
    let fracVal: number | null = null;
    const slashM = frac.match(slash);
    if (slashM) {
      const num = parseInt(slashM[1], 10);
      const den = parseInt(slashM[2], 10);
      if (den !== 0) fracVal = num / den;
    } else {
      fracVal = VULGAR_FRACTIONS[frac] ?? null;
    }
    return fracVal == null ? null : whole + fracVal;
  }

  // 2) Mixed number B: "2½"
  m = trimmed.match(mixedB);
  if (m) {
    const whole = parseInt(m[1], 10);
    const fracVal = VULGAR_FRACTIONS[m[2]] ?? null;
    return fracVal == null ? null : whole + fracVal;
  }

  // 3) Slash fraction: "1/3"
  m = trimmed.match(slash);
  if (m) {
    const num = parseInt(m[1], 10);
    const den = parseInt(m[2], 10);
    if (den === 0) return null;
    return num / den;
  }

  // 4) Vulgar fraction only: "½"
  if (Object.prototype.hasOwnProperty.call(VULGAR_FRACTIONS, trimmed)) {
    return VULGAR_FRACTIONS[trimmed];
  }

  // 5) Decimal or integer: "2.5" or "2,5"
  m = trimmed.match(decimal);
  if (m) {
    return parseFloat(trimmed.replace(",", "."));
  }

  return null;
}

// Helper: format a number back to either decimal or a nice vulgar fraction (if close)
export function formatQuantity(
  value: number,
  {
    formatAsFraction = true,
    fractionTolerance = 1e-3,
    maxDecimals = 2,
  }: IngredientMultiplierOptions = {}
): string {
  if (!Number.isFinite(value)) return String(value);

  if (!formatAsFraction) {
    const factor = Math.pow(10, maxDecimals);
    const rounded = Math.round(value * factor) / factor;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toString();
  }

  const whole = Math.floor(value);
  const frac = value - whole;

  // Find nearest common fraction within a tolerance
  let closest: string | null = null;
  let minDiff = Infinity;

  for (const [numVal, symbol] of COMMON_FRACTIONS) {
    const diff = Math.abs(frac - numVal);
    if (diff < minDiff) {
      minDiff = diff;
      closest = symbol;
    }
  }

  if (closest != null && minDiff <= fractionTolerance) {
    if (whole === 0) return closest;       // e.g., 0.5 -> "½"
    return `${whole}${closest}`;            // e.g., 1.5 -> "1½"
  }

  // Fall back to decimal
  const factor = Math.pow(10, maxDecimals);
  const rounded = Math.round(value * factor) / factor;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toString();
}

// Main function: multiplies all numeric tokens found in a string.
export function ingredientMultiplication(
  text: string,
  multiplication: number,
  options?: IngredientMultiplierOptions
): string {
  // Normalize the whole text up front to catch entities & superscripts
  const normalizedText = normalizeQuantityString(text);

  // Quantity tokens:
  // - mixed numbers with space: "1 1/2"
  // - mixed numbers without space: "2½"
  // - slash fractions: "1/3" (also covers "1⁄3" after normalization)
  // - vulgar fractions: "½"
  // - decimals/integers: "2", "2.5", "2,5"
  const quantityRegex =
    /(\d+\s+[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞)|(\d+[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])|(\d+\s*\/\s*\d+)|([¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])|(\d+(?:[.,]\d+)?)\b/g;

  return normalizedText.replace(quantityRegex, (match) => {
    const numeric = parseQuantity(match);
    if (numeric == null) return match;
    const multiplied = numeric * multiplication;
    return formatQuantity(multiplied, options);
  });
}

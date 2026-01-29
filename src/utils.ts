
import { createTheme, PaletteMode } from "@mui/material";
import { Language, TranslationFile } from "./Types.js";

const translations: TranslationFile = await import("./translations.json", {
    assert: { type: "json" }
});

export const isArrayField = <T>(field: unknown): field is T[] => Array.isArray(field);

export const translate = (key: string, language: Language) => getTranslationSet(language)[key] || key;

const getTranslationSet = (language: Language): Record<string, string> => {
    return translations[language];
}

export const getTheme = (mode: PaletteMode) =>
    createTheme({
        palette: {
            mode,
            ...(mode === 'light'
                ? {
                    primary: { main: '#1976d2' },
                    secondary: { main: '#dc004e' },
                }
                : {
                    primary: { main: '#90caf9' },
                    secondary: { main: '#f48fb1' },
                }),
        },
    });

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
  /**
   * If true, tries to render results with common unicode fractions (e.g., 1½).
   * If false, returns decimals (e.g., 1.5).
   * Default: true
   */
  formatAsFraction?: boolean;

  /**
   * Tolerance for snapping a decimal to a common fraction (default 1e-3).
   * Smaller = stricter snapping.
   */
  fractionTolerance?: number;

  /**
   * How many decimal digits when not using fraction format (default 2).
   */
  maxDecimals?: number;
};

// Helper: parse a quantity string into a number
export function parseQuantity(token: string): number | null {
  const trimmed = token.trim();

  // Mixed number like "1 1/2" or "2½"
  const mixedA = /^(\d+)\s+(\d+\/\d+|[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])$/;
  const mixedB = /^(\d+)([¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])$/;

  // Slash fraction like "1/3", "3/4"
  const slash = /^(\d+)\s*\/\s*(\d+)$/;

  // Decimal like "2.5" or "2,5" (comma as decimal separator accepted)
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
  // This regex finds likely quantity tokens:
  // - mixed numbers with space: "1 1/2"
  // - mixed numbers without space: "2½"
  // - slash fractions: "1/3"
  // - vulgar fractions: "½"
  // - decimals/integers: "2", "2.5", "2,5"
  const quantityRegex =
    /(\d+\s+[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞)|(\d+[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])|(\d+\s*\/\s*\d+)|([¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])|(\d+(?:[.,]\d+)?)\b/g;

  return text.replace(quantityRegex, (match) => {
    const numeric = parseQuantity(match);
    if (numeric == null) return match;
    const multiplied = numeric * multiplication;
    return formatQuantity(multiplied, options);
  });
}

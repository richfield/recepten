
import translations from "./translations.json";
import { Language } from "./Types.js";

export const isArrayField = <T>(field: unknown): field is T[] => Array.isArray(field);

export const translate = (key: string, language: Language) => getTranslationSet(language)[key] || key;

const getTranslationSet = (language: Language): Record<string, string> => {
    return translations[language];
}
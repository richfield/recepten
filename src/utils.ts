
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
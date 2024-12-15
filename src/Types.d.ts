export type Instruction = {
    '@type': 'HowToStep';
    name: string;
    text: string;
};

export type Author = {
    '@type': 'Organization';
    name: string;
};

type NutrionInformation = {
    '@type': 'NutritionInformation';
    calories: string;
    carbohydrateContent: string;
    proteinContent: string;
    fatContent: string;
    saturatedFatContent: string;
    transFatContent: string;
    cholesterolContent: string;
    sodiumContent: string;
    fiberContent: string;
    sugarContent: string;
    unsaturatedFatContent: string;
    servingSize: string;
};

export type RecipeData = {
    '@context'?: 'https://schema.org';
    '@type'?: 'Recipe';
    author?: Author;
    keywords?: string[];
    image?: string;
    recipeIngredient?: string[];
    name?: string;
    url?: string;
    nutrition?: NutrionInformation;
    cookTime?: string; // Can be an empty string if not provided
    prepTime?: string; // Can be an empty string if not provided
    totalTime?: string;
    recipeInstructions?: Instruction[];
    recipeYield?: string;
    description?: string;
    recipeCategory?: string[];
    recipeCuisine?: string[];
    aggregateRating?: string; // Optional field
    video?: string; // Optional field
    id?: string;
};

export interface Translations {
    [key: string]: string;
}

export type Language = "en"|"nl"


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
    images?: string[];
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
    _id?: string;
};

export interface Translations {
    [key: string]: string;
}

export type Language = "en"|"nl"

/**
 * Represents the settings associated with a user profile.
 */
export interface UserSettings {
    theme: string;
    language: Language;
}

/**
 * Represents a user profile in the application.
 */
export type UserProfile = {
    /**
     * Firebase User ID.
     */
    firebaseUID: string;

    /**
     * Dictionary of user settings.
     */
    settings: UserSettings;

    /**
     * Array of roles assigned to the user.
     */
    roles: string[];

    /**
     * Array of groups the user belongs to.
     */
    groups: string[];

    /**
     * Timestamp of when the profile was created.
     */
    createdAt: Date;

    /**
     * Timestamp of when the profile was last updated.
     */
    updatedAt: Date;
}


export interface RoleData {
    name: string;
    _id: string;
}

export interface GroupData {
    name: string;
    _id: string;
}

export type DateLink = {
    date: Date; // Use the JavaScript Date object
    recipes: RecipeData[]; // Assuming RecipeData is already defined as shown before
};

export type DatesResponse = {
    _id: Date,
    recipes: RecipeData[]
}
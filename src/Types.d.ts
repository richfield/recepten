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
    image?: Buffer;
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
    [key: string]: string; // A dictionary of settings (key-value pairs)
}

/**
 * Represents a user profile in the application.
 */
export interface UserProfile {
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

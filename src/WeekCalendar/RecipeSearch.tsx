import React, { useState, useEffect, useCallback } from 'react';
import { Box, CircularProgress, Grid2 } from '@mui/material';
import { useApplicationContext } from "../Components/ApplicationContext/useApplicationContext.js";
import RecipeRow from './RecipeRow.js'; // Import the RecipeRow component
import { RecipeData } from "../Types.js";
import { translate } from "../utils.js";

interface RecipeSearchProps {
    searchQuery: string;
    onRecipeSelected: (id: string) => void;
    selectedDate: Date;
}

const RecipeSearch: React.FC<RecipeSearchProps> = ({ searchQuery, selectedDate, onRecipeSelected }) => {
    const { apiFetch, language } = useApplicationContext();
    const [recipes, setRecipes] = useState<RecipeData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchData = useCallback(async (url: string) => {
        setLoading(true);
        try {
            const response = await apiFetch<RecipeData[]>(url, 'GET');
            if (response.data) {
                setRecipes(response.data);
            }
        } catch (error) {
            console.error('Error fetching recipe data:', error);
        } finally {
            setLoading(false);
        }
    }, [apiFetch]);

    useEffect(() => {
        if (searchQuery.length > 2) {
            const url = `/api/recipes/search?query=${searchQuery}`;
            fetchData(url);
        }
    }, [searchQuery, fetchData]);

    const handleSelectRecipe =  useCallback(async (id: string) => {
        const result = await apiFetch(`/api/calendar/link`, 'POST', { date: selectedDate, recipeId: id }, {
            headers: { 'Content-Type': 'application/json' },
        });
        if(result) {
            onRecipeSelected(id);
        }
    }, [apiFetch, onRecipeSelected, selectedDate]);

    return (
        <Box>
            {loading ? (
                <CircularProgress />
            ) : (
                <Grid2 container spacing={2}>
                    {recipes.length > 0 ? (
                        recipes.map((recipe) => (
                            <Grid2 size={{ xs: 12 }} key={recipe._id}>
                                <RecipeRow recipe={recipe} handleSelect={handleSelectRecipe} />
                            </Grid2>
                        ))
                    ) : (
                        <p>{translate("noRecipeFound", language)}</p>
                    )}
                </Grid2>
            )}
        </Box>
    );
};

export default RecipeSearch;

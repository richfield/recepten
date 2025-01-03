import { useCallback, useEffect, useState } from "react";
import { Grid2 } from "@mui/material";
import { useParams } from "react-router-dom";
import { RecipeData } from "../Types.js";
import { RecipeCard } from "./RecipeCard.js";
import { useApplicationContext } from "../Components/ApplicationContext/useApplicationContext.js";

const RecipeList: React.FC = () => {
    const { apiFetch } = useApplicationContext();
    const [recipes, setRecipes] = useState<RecipeData[]>()
    const { searchQuery } = useParams();
    const fetchData = useCallback(async (url: string) => {
        try {
            const response = await apiFetch<RecipeData[]>(url, "GET"); // API call through proxy
            if(response.data) {
                setRecipes(response.data)
            }
        } catch (error) {
            console.error('Error fetching recipe data:', error);
        }
    }, [apiFetch]);
    useEffect(() => {
        const url = searchQuery ? `/api/recipes/search?query=${searchQuery}` : "/api/recipes"
        fetchData(url)
    }, [searchQuery, fetchData])

    const onDeleted = () => {
        fetchData("/api/recipes")
    };

    return <Grid2 container spacing={2}> {
            recipes && recipes.map((recipe, index) => (
                <RecipeCard key={recipe._id} recipe={recipe} index={index} onDeleted={onDeleted} />
            ))
        }
    </Grid2>
};

export default RecipeList
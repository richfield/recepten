import axios from "axios";
import { useEffect, useState } from "react";
import { Grid2 } from "@mui/material";
import { useParams } from "react-router-dom";
import { RecipeData } from "../Types.js";
import { RecipeCard } from "./RecipeCard.js";

const RecipeList: React.FC = () => {
    const [recipes, setRecipes] = useState<RecipeData[]>()
    const { searchQuery } = useParams();
    const fetchData = async (url: string) => {
        try {
            const response = await axios.get(url); // API call through proxy
            console.log(response)
            setRecipes(response.data)
        } catch (error) {
            console.error('Error fetching recipe data:', error);
        }
    };
    useEffect(() => {
        const url = searchQuery ? `/api/recipes/search?query=${searchQuery}` : "/api/recipes"
        fetchData(url)
    }, [searchQuery])

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
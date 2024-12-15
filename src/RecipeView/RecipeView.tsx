import axios from "axios";
import { useEffect, useState } from "react";
import { Language, RecipeData } from "../Types.js";
import RecipeCard from "../RecipeCard/RecipeCard.js";
import { useParams } from "react-router-dom";

type RecipeViewProps = {
    language: Language
};

const RecipeView: React.FC<RecipeViewProps> = ({ language }) => {
    const { id } = useParams();
    const [recipe, setRecipe] = useState<RecipeData>()
    const fetchData = async (url: string) => {
        try {
            const response = await axios.get(url); // API call through proxy
            console.log(response)
            setRecipe(response.data)
        } catch (error) {
            console.error('Error fetching recipe data:', error);
        }
    };
    useEffect(() => {
        fetchData(`/api/recipes/get/${id}`)
    },[id])
    const handleSave = async (data: RecipeData) => {
        return await axios.post('/api/recipes/save', data)
    }
    console.log({recipe})
    return <RecipeCard save={handleSave} recipe={recipe} language={language}/>
};

export default RecipeView
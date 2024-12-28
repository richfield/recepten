import axios from "axios";
import { useEffect, useState } from "react";
import { Table } from "@mui/material";
import { useParams } from "react-router-dom";
import { useApplicationContext } from "../Components/ApplicationContext/useApplicationContext.js";
import { RecipeData } from "../Types.js";
import { translate } from "../utils.js";
import { RecipeRow } from "./RecipeRow.js";



const RecipeList: React.FC = () => {
    const { language } = useApplicationContext();
    const [recipes, setRecipes] = useState<RecipeData[]>()
    const { searchQuery } = useParams();
    console.log({searchQuery})
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

    return <Table >
        <thead>
            <tr>
                <th>#</th>
                <th>{translate("name", language)}</th>
                <th>{translate("description", language)}</th>
                <th></th>
            </tr>
        </thead>
        <tbody> {
            recipes && recipes.map((recipe, index) => (
                <RecipeRow key={recipe._id} recipe={recipe} index={index} onDeleted={onDeleted} />
            ))
        }
        </tbody>
    </Table>
};

export default RecipeList
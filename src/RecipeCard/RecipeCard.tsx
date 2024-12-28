import React, { useEffect, useState } from 'react';
import { Grid2 } from "@mui/material";
import { AxiosResponse } from 'axios';
import { RecipeData, Language } from "../Types.js";
import { v4 as uuidv4 } from 'uuid';
import ViewRecipe from "./ViewRecipe.js";
import EditRecipe from "./EditRecipe.js";
import { useNavigate } from "react-router-dom";

type RecipeCardProps = {
    recipe: RecipeData | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    save: (data: RecipeData) => Promise<AxiosResponse<any, any>>;
    language: Language,
    edit: boolean
};

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, save, language, edit = false }) => {
    const [editableRecipe, setEditableRecipe] = useState<RecipeData | undefined>(recipe);
    const [editMode, setEditMode] = useState<boolean>(edit);
    const navigate = useNavigate();
    useEffect(() => {
        if (recipe !== undefined) {
            recipe._id = recipe._id || uuidv4()
        }
        setEditableRecipe(recipe)
    }, [recipe])

    if (!editableRecipe) {
        return <></>
    }

    const handleSave = (recipe: RecipeData) => {
        save(recipe);
        setEditableRecipe(recipe);
        navigate(`/recipe/${editableRecipe._id}`)
        setEditMode(false);
    }

    const handleToggle = () => {
        if (editMode) {
            navigate(`/recipe/${editableRecipe._id}`)
        } else {
            navigate(`/recipe/${editableRecipe._id}/edit`)
        }
        setEditMode(!editMode)
    }

    return (
        editableRecipe && (
            <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12 }} component="div">
                    {editMode ? <EditRecipe language={language} recipe={editableRecipe} onSave={handleSave} toggleEdit={handleToggle} /> :
                        <ViewRecipe language={language} recipe={editableRecipe} toggleEdit={handleToggle} />}
                </Grid2>
            </Grid2>
        )
    );
}

export default RecipeCard;

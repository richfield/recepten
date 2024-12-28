import React, { useEffect, useState } from 'react';
import {Grid} from '@mui/material';
import { AxiosResponse } from 'axios';
import { RecipeData, Language } from "../Types.js";
import { v4 as uuidv4 } from 'uuid';
import ViewRecipe from "./ViewRecipe.js";
import EditRecipe from "./EditRecipe.js";

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

    useEffect(() => {
        if (recipe !== undefined) {
            recipe._id = recipe._id || uuidv4()
        }
        console.log({ recipe })
        setEditableRecipe(recipe)
    }, [recipe])

    if (!editableRecipe) {
        return <></>
    }

    const handleSave = (recipe: RecipeData) => {
        save(recipe);
        setEditableRecipe(recipe);
        setEditMode(false);
    }

    const handleToggle = () => {
        setEditMode(!editMode)
    }

    return (
        editableRecipe && (
            <Grid container spacing={2}>
                <Grid item xs={12} component="div">
                    {editMode ? <EditRecipe language={language} recipe={editableRecipe} onSave={handleSave} toggleEdit={handleToggle}/> :
                        <ViewRecipe language={language} recipe={editableRecipe} toggleEdit={handleToggle} />}
                </Grid>
            </Grid>
        )
    );
}

export default RecipeCard;

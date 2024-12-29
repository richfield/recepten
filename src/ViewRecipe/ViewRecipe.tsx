// ViewRecipe Component
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardMedia, List, ListItem, Container, Typography, IconButton, Grid2, ListSubheader } from "@mui/material";
import { RecipeData, Language } from "../Types.js";
import { translate } from "../utils.js";
import moment from 'moment/min/moment-with-locales';
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useApplicationContext } from "../Components/ApplicationContext/useApplicationContext.js";
import { ArrowLeft, ArrowRight, ExitToApp } from "@mui/icons-material";


const formatTime = (time: string | undefined, language: Language) => {
    if (!time) {
        return time;
    }
    const duration = moment.duration(time);

    return (duration.hours() > 0 || duration.minutes() > 0) && duration.locale(language).humanize();
};

const ViewRecipe: React.FC = () => {
    const { language } = useApplicationContext();
    const { id } = useParams();
    const [recipe, setRecipe] = useState<RecipeData>()
    const navigate = useNavigate();
    const fetchData = async (url: string) => {
        try {
            const response = await axios.get(url); // API call through proxy
            setRecipe(response.data)
        } catch (error) {
            console.error('Error fetching recipe data:', error);
        }
    };
    const toggleEdit = () => {
        navigate(-1);
    }

    const yieldDown = () => {
        setNewRecipeYield((newRecipeYield) => {
            const updatedYield = Math.max(newRecipeYield - 1, 1);
            setMultiplication(updatedYield / recipeYield);
            return updatedYield;
        });
    };

    const yieldUp = () => {
        setNewRecipeYield((newRecipeYield) => {
            const updatedYield = newRecipeYield + 1;
            setMultiplication(updatedYield / recipeYield);
            return updatedYield;
        });
    };

    useEffect(() => {
        fetchData(`/api/recipes/get/${id}`)
    }, [id])

    const [multiplication, setMultiplication] = useState<number>(1);
    const ingredientMultiplication: ((value: string) => string) = (value) => {
        return value.replace(/(\d+(\.\d+)?)/g, (match) => {
            const number = parseFloat(match);
            return (number * multiplication).toString();
        });
    };
    const [recipeYield, setRecipeYield] = useState<number>(1);
    const [newRecipeYield, setNewRecipeYield] = useState<number>(1);

    useEffect(() => {
        const newYield = parseInt(recipe?.recipeYield?.split(',')[0] || '4')
        setRecipeYield(newYield);
        setNewRecipeYield(newYield);
    }, [recipe?.recipeYield])

    if (!recipe) {
        return <></>
    }

    return (
        <Container>
            <Grid2 container spacing={2} justifyContent="space-between" alignItems="center">
                <Grid2>
                    <Typography variant="h4">{recipe.name}</Typography>
                </Grid2>
                <Grid2>
                    <IconButton onClick={toggleEdit}>
                        <ExitToApp />
                    </IconButton>
                </Grid2>
            </Grid2>
            <Grid2 container spacing={2}>
                <Grid2 size={{ md: 3 }} style={{ textAlign: "center" }}>
                    <Card>
                        {recipe.images && recipe.images.length > 0 && (
                            <CardMedia
                                component="img"
                                style={{ width: "100%" }}
                                image={`/api/recipes/${recipe._id}/image`}
                                alt={recipe.name} />
                        )}
                        <CardContent>
                            <List>
                                <ListItem>{translate("cookTime", language)}: {formatTime(recipe.cookTime, language)}</ListItem>
                                <ListItem>{translate("prepTime", language)}: {formatTime(recipe.prepTime, language)}</ListItem>
                                <ListItem>{translate("totalTime", language)}: {formatTime(recipe.totalTime, language)}</ListItem>
                            </List>
                        </CardContent>
                    </Card>
                    {recipe.keywords?.length !== 0 && (
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{translate("keywords", language)}</Typography>
                                <Typography>{recipe.keywords?.join(', ')}</Typography>
                            </CardContent>
                        </Card>
                    )}
                    {recipe.recipeCuisine?.length !== 0 && (
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{translate("recipeCuisine", language)}</Typography>
                                <Typography>{recipe.recipeCuisine?.join(', ')}</Typography>
                            </CardContent>
                        </Card>
                    )}
                    {recipe.recipeYield?.length !== 0 && (
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{translate("recipeYield", language)}</Typography>
                                <Grid2 container justifyContent="center" alignItems="center">
                                    <IconButton onClick={yieldDown}>
                                        <ArrowLeft />
                                    </IconButton>
                                    <Typography>{newRecipeYield}</Typography>
                                    <IconButton onClick={yieldUp}>
                                        <ArrowRight />
                                    </IconButton>
                                </Grid2>
                            </CardContent>
                        </Card>
                    )}
                </Grid2>
                <Grid2 size={{ md: 9 }}>
                    <Card>
                        <CardContent>
                            {renderField(recipe, "description", language)}
                            {renderField(recipe, "recipeInstructions", language, ({ text }) => text)}
                            {renderField(recipe, "recipeIngredient", language, ingredientMultiplication)}
                            {renderField(recipe, "recipeCategory", language)}
                        </CardContent>
                    </Card>
                </Grid2>
            </Grid2>
        </Container>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderField = (recipe: RecipeData, fieldName: keyof RecipeData, language: Language, valueProvider?: (value: any) => string) => {
    const value = recipe[fieldName];
    if (!value) return null;

    if (Array.isArray(value)) {
        return (
            <List
                subheader={
                    <ListSubheader component="div" id="nested-list-subheader">
                        {translate(fieldName, language)}
                    </ListSubheader>
                }>
                {value.map((item, index) => {
                    const currentValue = valueProvider ? valueProvider(item) : item.toString();
                    return (
                        <ListItem key={index}>{currentValue}</ListItem>
                    );
                })}
            </List>
        );
    }
    const currentValue = valueProvider ? valueProvider(value) : value.toString();
    return (
        <List
            subheader={
                <ListSubheader component="div" id="nested-list-subheader">
                    {translate(fieldName, language)}
                </ListSubheader>
            }>
            <ListItem>{currentValue}</ListItem>
        </List>
    );
};

export default ViewRecipe;

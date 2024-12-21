// ViewRecipe Component
import React from 'react';
import { Card, CardContent, CardMedia, List, ListItem, Container, Grid, Typography, IconButton } from "@mui/material";
import { RecipeData, Language } from "../Types.js";
import { translate } from "../utils.js";
import moment from 'moment/min/moment-with-locales';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

type ViewRecipeProps = {
    recipe: RecipeData;
    language: Language;
    toggleEdit: () => void
};

const formatTime = (time: string | undefined, language: Language) => {
    if (!time) {
        return time;
    }
    const duration = moment.duration(time);

    return (duration.hours() > 0 || duration.minutes() > 0) && duration.locale(language).humanize();
};

const ViewRecipe: React.FC<ViewRecipeProps> = ({ recipe, language, toggleEdit }) => (
    <Container>
        <Grid container spacing={2} justifyContent="space-between" alignItems="center">
            <Grid item>
                <Typography variant="h4">{recipe.name}</Typography>
            </Grid>
            <Grid item>
                <IconButton onClick={toggleEdit}>
                    <FontAwesomeIcon icon={faEdit} />
                </IconButton>
            </Grid>
        </Grid>
        <Grid container spacing={2}>
            <Grid item md={3} style={{ textAlign: "center" }}>
                <Card>
                    {recipe.images && recipe.images.length > 0 && (
                        <CardMedia
                            component="img"
                            style={{ width: "100%" }}
                            image={`/api/recipes/${recipe._id}/image`}
                            alt={recipe.name}
                        />
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
            </Grid>
            <Grid item md={9}>
                <Card>
                    <CardContent>
                        <List>
                            <ListItem>{translate("description", language)}: {recipe.description}</ListItem>
                            <ListItem>
                                {translate("ingredients", language)}:
                                <List>
                                    {recipe.recipeIngredient?.map((ingredient, index) => (
                                        <ListItem key={index}>{ingredient}</ListItem>
                                    ))}
                                </List>
                            </ListItem>
                            <ListItem>
                                {translate("instructions", language)}:
                                <List>
                                    {recipe.recipeInstructions?.map((instruction, index) => (
                                        <ListItem key={index}>{instruction.text}</ListItem>
                                    ))}
                                </List>
                            </ListItem>
                        </List>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    </Container>
);

export default ViewRecipe;

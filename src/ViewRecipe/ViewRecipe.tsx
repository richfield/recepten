// ViewRecipe Component
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Card, CardContent, CardMedia, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, Container, Typography, IconButton, Grid2, ListSubheader } from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { RecipeData, Language } from "../Types.js";
import { translate } from "../utils.js";
import moment, { Moment } from 'moment/min/moment-with-locales';
import { useParams, useNavigate } from "react-router-dom";
import { useApplicationContext } from "../Components/ApplicationContext/useApplicationContext.js";
import { ArrowLeft, ArrowRight, CalendarMonth, Edit, ExitToApp } from "@mui/icons-material";
import ScreenWakeLock from "../Components/ScreenWakeLock/ScreenWakeLock.js";
import { useBusy } from '../Busy/BusyContext.js';
import { ingredientMultiplication } from '../multiplier.js';


const formatTime = (time: string | undefined, language: Language) => {
    if (!time) {
        return time;
    }
    const duration = moment.duration(time);

    return (duration.hours() > 0 || duration.minutes() > 0) && duration.locale(language).humanize();
};

const ViewRecipe: React.FC = () => {
    const { showBusy, hideBusy } = useBusy();
    const { language, fetchAuthenticatedImage, apiFetch, showError, user } = useApplicationContext();
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
    const { id } = useParams();
    const [recipe, setRecipe] = useState<RecipeData>();
    const [selectedDate, setSelectedDate] = useState<Moment | null>(moment());
    const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
    useEffect(() => {
        const fetchImage = async () => {
            const image = await fetchAuthenticatedImage(`/api/recipes/${recipe?._id}/image`);
            setImageUrl(image);
        };
        if (recipe?._id) {
            fetchImage();
        }
    }, [recipe, fetchAuthenticatedImage]);
    const navigate = useNavigate();
    const fetchData = React.useCallback(async (url: string) => {
        showBusy()
        if (user) {
            try {
                const response = await apiFetch<RecipeData>(url, 'GET');
                setRecipe(response.data)
            } catch (error) {
                hideBusy()
                showError(error)
                console.error('Error fetching recipe data:', error);
            }
        }
    }, [apiFetch, hideBusy, showBusy, showError, user]);
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
        showBusy();
        fetchData(`/api/recipes/get/${id}`);
        hideBusy();
    }, [id, fetchData, showBusy, hideBusy]);

    const [multiplication, setMultiplication] = useState<number>(1);

    const multiplyQuantities = useCallback(
        (value: string) =>
            ingredientMultiplication(value, multiplication, {
                formatAsFraction: true,
                fractionTolerance: 1e-3,
                maxDecimals: 2,
            }),
        [multiplication]
    );

    const [recipeYield, setRecipeYield] = useState<number>(1);
    const [newRecipeYield, setNewRecipeYield] = useState<number>(1);

    useEffect(() => {
        const newYield = parseInt(recipe?.recipeYield?.split(',')[0] || '4')
        setRecipeYield(newYield);
        setNewRecipeYield(newYield);
    }, [recipe?.recipeYield])

    useEffect(() => {
        if (!recipe) {
            showBusy()
        } else {
            hideBusy()
        }
    }, [hideBusy, recipe, showBusy])

    if (!recipe) {
        return <></>
    }

    const goToEdit = (): void => {
        navigate(`/recipe/${recipe._id}/edit`)
    }

    const handleAddToCalendar = async () => {
        if (!recipe?._id || !selectedDate) {
            return;
        }

        try {
            const dateStr = selectedDate.format('YYYY-MM-DD');
            const normalizedDate = moment.utc(dateStr, 'YYYY-MM-DD').toDate();
            await apiFetch(`/api/calendar/link`, 'POST', { date: normalizedDate, recipeId: recipe._id }, {
                headers: { 'Content-Type': 'application/json' },
            });
            setCalendarDialogOpen(false);
        } catch (error) {
            showError(error);
            console.error('Error adding recipe to calendar:', error);
        }
    };

    return (
        <Container>
            <Grid2 container spacing={2} justifyContent="space-between" alignItems="center">
                <Grid2>
                    <Typography variant="h4">{recipe.name}</Typography>
                </Grid2>
                <Grid2>
                    <ScreenWakeLock />
                    <IconButton onClick={() => setCalendarDialogOpen(true)} size="small">
                        <CalendarMonth />
                    </IconButton>
                    <IconButton onClick={toggleEdit}>
                        <ExitToApp />
                    </IconButton>
                    <IconButton onClick={goToEdit}>
                        <Edit />
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
                                image={imageUrl}
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
                            {renderField(recipe, "recipeIngredient", language, multiplyQuantities)}
                            {renderField(recipe, "recipeCategory", language)}
                        </CardContent>
                    </Card>
                </Grid2>
            </Grid2>

            <Dialog open={calendarDialogOpen} onClose={() => setCalendarDialogOpen(false)}>
                <DialogTitle>Select a date</DialogTitle>
                <DialogContent>
                    <DatePicker
                        value={selectedDate}
                        onChange={(newValue) => setSelectedDate(newValue)}
                        format="DD-MM-YYYY"
                        slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCalendarDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddToCalendar} variant="contained">Add to calendar</Button>
                </DialogActions>
            </Dialog>
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

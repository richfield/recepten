// ViewRecipe Component
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Card, CardContent, CardMedia, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, Container, Typography, IconButton, Grid2, ListSubheader, Box } from "@mui/material";
import { Rating } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { RecipeData, Language, RecipeRatingSummary, RecipeRatingEntry } from "../Types.js";
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

const ratingStyles = (theme: Theme) => ({
    '& .MuiRating-iconFilled': {
        color: '#FF6F3C',
    },
    '& .MuiRating-iconEmpty': {
        color: 'transparent',
        stroke: theme.palette.text.secondary,
        strokeWidth: 1.2,
        fill: 'transparent',
        opacity: 0.7,
    },
    '& .MuiRating-iconEmpty svg': {
        fill: 'transparent',
        stroke: theme.palette.text.secondary,
        strokeWidth: 1.2,
    },
});

const ViewRecipe: React.FC = () => {
    const { showBusy, hideBusy } = useBusy();
    const { language, fetchAuthenticatedImage, apiFetch, showError, user, getProfileNames } = useApplicationContext();
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
    const { id } = useParams();
    const [recipe, setRecipe] = useState<RecipeData>();
    const [selectedDate, setSelectedDate] = useState<Moment | null>(moment());
    const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
    const [ratingSummary, setRatingSummary] = useState<RecipeRatingSummary>({ average: 0, count: 0, total: 0, ratings: [] });
    const [myRating, setMyRating] = useState<number | null>(null);
    const [ratings, setRatings] = useState<RecipeRatingEntry[]>([]);
    const [profileMap, setProfileMap] = useState<Record<string, { displayName?: string; email?: string; photoURL?: string }>>({});
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

    const goToEdit = (): void => {
        if (!recipe?._id) {
            return;
        }
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
            navigate('/calendar', { state: { selectedDate: normalizedDate } });
        } catch (error) {
            showError(error);
            console.error('Error adding recipe to calendar:', error);
        }
    };

    const loadRatings = useCallback(async () => {
        if (!recipe?._id) {
            return;
        }

        try {
            const [ratingsResponse, myRatingResponse] = await Promise.all([
                apiFetch<RecipeRatingSummary>(`/api/ratings/recipe/${recipe._id}/ratings`, 'GET'),
                apiFetch<RecipeRatingEntry | null>(`/api/ratings/recipe/${recipe._id}/my-rating`, 'GET').catch(() => ({ data: null })),
            ]);

            const nextSummary = ratingsResponse.data ?? { average: 0, count: 0, total: 0, ratings: [] };
            setRatingSummary(nextSummary);
            setRatings(nextSummary.ratings ?? []);
            setMyRating(myRatingResponse.data?.value ?? null);
        } catch (error) {
            console.error('Error fetching recipe ratings:', error);
        }
    }, [apiFetch, recipe?._id]);

    useEffect(() => {
        loadRatings();
    }, [loadRatings, recipe?._id]);

    useEffect(() => {
        const uniqueUserIds = Array.from(new Set((ratings || []).map((rating) => rating.userId).filter(Boolean)));
        if (uniqueUserIds.length === 0) {
            setProfileMap({});
            return;
        }

        getProfileNames(uniqueUserIds).then((map) => setProfileMap(map)).catch(() => setProfileMap({}));
    }, [ratings, getProfileNames]);

    const handleRatingChange = async (_event: React.SyntheticEvent<Element, Event>, value: number | null) => {
        if (!recipe?._id || !user || value === null) {
            return;
        }

        try {
            setMyRating(value);
            await apiFetch(`/api/ratings/recipe/${recipe._id}/rating`, 'POST', { value });
            await loadRatings();
        } catch (error) {
            setMyRating(null);
            showError(error);
        }
    };

    if (!recipe) {
        return <Container />;
    }

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
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Rating</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                    <Rating value={ratingSummary.average || 0} precision={0.5} readOnly sx={ratingStyles} />
                                    <Typography variant="body2">{ratingSummary.count ? Number.isInteger(ratingSummary.average) ? ratingSummary.average.toString() : ratingSummary.average.toFixed(1) : '0'} / 5</Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary">{ratingSummary.count} rating{ratingSummary.count === 1 ? '' : 's'}</Typography>
                                {user && (
                                    <Box sx={{ mt: 1 }}>
                                        <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>Your rating</Typography>
                                        <Rating name={`recipe-rating-${recipe._id}`} value={myRating ?? 0} precision={0.5} onChange={handleRatingChange} sx={ratingStyles} />
                                    </Box>
                                )}
                            </Box>
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
                            {ratings.length > 0 && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 1 }}>Ratings</Typography>
                                    {ratings.map((rating) => (
                                        <Box key={rating._id ?? `${rating.userId}-${rating.value}`} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, py: 0.5 }}>
                                            <Typography variant="body2">{profileMap[rating.userId]?.displayName ?? rating.userId}</Typography>
                                            <Rating value={rating.value} precision={0.5} readOnly size="small" sx={ratingStyles} />
                                        </Box>
                                    ))}
                                </Box>
                            )}
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

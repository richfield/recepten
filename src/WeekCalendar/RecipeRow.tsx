import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, CardMedia, Grid2, Dialog, DialogActions, DialogContent, DialogTitle, Button } from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import moment, { Moment } from 'moment/min/moment-with-locales';
import { RecipeData } from "../Types.js";
import { useApplicationContext } from "../Components/ApplicationContext/useApplicationContext.js";
import { CalendarMonth } from "@mui/icons-material";

interface RecipeRowProps {
    recipe: RecipeData;
    handleSelect: (id: string, date?: Date) => void
}

const RecipeRow: React.FC<RecipeRowProps> = ({ recipe, handleSelect }) => {
    const { fetchAuthenticatedImage } = useApplicationContext();

    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
    const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Moment | null>(moment());

    useEffect(() => {
        const fetchImage = async () => {
            const image = await fetchAuthenticatedImage(`/api/recipes/${recipe._id}/image`);
            setImageUrl(image);
        };
        fetchImage();
    }, [recipe._id, fetchAuthenticatedImage]);

    const handleClick = () => {
        if (recipe._id) {
            handleSelect(recipe._id, selectedDate?.clone().startOf('day').toDate());
        }
        setCalendarDialogOpen(false);
    }

    return (
        <>
            <Card>
                <Grid2 container>
                    <Grid2 size={{xs:4}}>
                        <CardMedia
                            component="img"
                            height="140"
                            image={imageUrl}
                            alt={recipe.name}
                            sx={{ width: '100%', objectFit: 'cover' }} // Ensure the image covers the area
                        />
                    </Grid2>
                    <Grid2  size={{xs:8}}>
                        <CardContent>
                            <Typography variant="h6">{recipe.name}</Typography>
                            <Typography variant="body2" color="textSecondary">
                                {recipe.description}
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => setCalendarDialogOpen(true)}
                                startIcon={<CalendarMonth />}
                                sx={{ mt: 1 }}
                            >
                                Select
                            </Button>
                        </CardContent>
                    </Grid2>
                </Grid2>
            </Card>

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
                    <Button onClick={handleClick} variant="contained">Add to calendar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default RecipeRow;

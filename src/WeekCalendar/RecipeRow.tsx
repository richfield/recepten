import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, CardMedia, Grid2, Button } from "@mui/material";
import { RecipeData } from "../Types.js";
import { useApplicationContext } from "../Components/ApplicationContext/useApplicationContext.js";
import { translate } from "../utils.js";
import { CalendarMonth } from "@mui/icons-material";

interface RecipeRowProps {
    recipe: RecipeData;
    handleSelect: (id: string) => void
}

const RecipeRow: React.FC<RecipeRowProps> = ({ recipe, handleSelect }) => {
    const { fetchAuthenticatedImage, language } = useApplicationContext();

    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

    useEffect(() => {
        const fetchImage = async () => {
            const image = await fetchAuthenticatedImage(`/api/recipes/${recipe._id}/image`);
            setImageUrl(image);
        };
        fetchImage();
    }, [recipe._id, fetchAuthenticatedImage]);

    return (
        <>
            <Card>
                <Grid2 container>
                    <Grid2 size={{ xs: 4 }}>
                        <CardMedia
                            component="img"
                            height="140"
                            image={imageUrl}
                            alt={recipe.name}
                            sx={{ width: '100%', objectFit: 'cover' }} // Ensure the image covers the area
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 8 }}>
                        <CardContent>
                            <Typography variant="h6">{recipe.name}</Typography>
                            <Typography variant="body2" color="textSecondary">
                                {recipe.description}
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => recipe._id && handleSelect(recipe._id)}
                                startIcon={<CalendarMonth />}
                                sx={{ mt: 1 }}
                            >
                                {translate('select', language)}
                            </Button>
                        </CardContent>
                    </Grid2>
                </Grid2>
            </Card>

        </>
    );
};

export default RecipeRow;

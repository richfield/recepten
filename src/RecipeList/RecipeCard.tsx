import { Edit, Delete, Cancel, OpenInBrowser } from "@mui/icons-material";
import { Button, ButtonGroup, Card, CardActions, CardContent, CardMedia, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid2, IconButton, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RecipeData } from "../Types.js";
import { useApplicationContext } from "../Components/ApplicationContext/useApplicationContext.js";

export const RecipeCard = ({ recipe, index, onDeleted }: { recipe: RecipeData; index: number, onDeleted: () => void }) => {
    const { fetchAuthenticatedImage, apiFetch } = useApplicationContext();
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
    useEffect(() => {
        const fetchImage = async () => {
            const image = await fetchAuthenticatedImage(`/api/recipes/${recipe._id}/image`);
            setImageUrl(image);
        };
        fetchImage();
    }, [recipe._id, fetchAuthenticatedImage]);

    const [open, setOpen] = useState(false);
    const handleDelete = () => {
        setOpen(true); // Open the dialog
    };
    const navigate = useNavigate();
    const handleClose = () => setOpen(false); // Close the dialog

    const confirmDelete = async () => {
        await apiFetch(`/api/recipes/${recipe._id}`, 'DELETE'); // API call through proxy
        onDeleted();
        setOpen(false); // Close dialog after deletion
    };

    return (<Grid2 size={{ md: 3, xs: 12 }} key={index}>
        <Card onDoubleClick={() => navigate(`/recipe/${recipe._id}`)}>
            <CardMedia
                component="img"
                height="140"
                image={imageUrl}
                alt={recipe.name}
            />
            <CardContent>
                <Typography variant="h5" component="div">
                    {recipe.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {recipe.description}
                </Typography>
            </CardContent>
            <CardActions style={{ justifyContent: 'flex-end' }}>
                <ButtonGroup>
                    <Link to={`/recipe/${recipe._id}`}>
                        <IconButton size="small">
                            <OpenInBrowser fontSize="small" />
                        </IconButton>
                    </Link>
                    <Link to={`/recipe/${recipe._id}/edit`}>
                        <IconButton size="small">
                            <Edit fontSize="small" />
                        </IconButton>
                    </Link>
                    <IconButton size="small" onClick={handleDelete}>
                        <Delete fontSize="small" />
                    </IconButton>
                </ButtonGroup>
            </CardActions>
        </Card>
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
                <DialogContentText>Are you sure you want to delete this recipe?</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="secondary" startIcon={<Cancel />}>
                    Cancel
                </Button>
                <Button onClick={confirmDelete} color="error" startIcon={<Delete />}>
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    </Grid2>
    );
};

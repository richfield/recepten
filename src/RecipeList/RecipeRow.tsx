import { Edit, Delete, Cancel } from "@mui/icons-material";
import { Button, ButtonGroup, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton } from "@mui/material";
import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RecipeData } from "../Types.js";

export const RecipeRow = ({ recipe, index, onDeleted }: { recipe: RecipeData; index: number, onDeleted: () => void }) => {
    const [open, setOpen] = useState(false);
    const handleDelete = () => {
        setOpen(true); // Open the dialog
    };
    const navigate = useNavigate();
    const handleClose = () => setOpen(false); // Close the dialog

    const confirmDelete = async () => {
        await axios.delete(`/api/recipes/${recipe._id}`); // API call through proxy
        onDeleted();
        setOpen(false); // Close dialog after deletion
    };
    console.log({recipe, id: recipe._id})
    return (
        <tr onDoubleClick={() => navigate(`/recipe/${recipe._id}`)}>
            <td>{index + 1}</td>
            <td>{recipe.name}</td>
            <td>{recipe.description}</td>
            <td>
                <ButtonGroup>
                    <Link to={`/recipe/${recipe._id}`}>
                        <IconButton color="primary">
                            <Edit />
                        </IconButton>
                    </Link>
                    <IconButton color="error" onClick={handleDelete}>
                        <Delete />
                    </IconButton>

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
                </ButtonGroup>
            </td>
        </tr>
    );
};

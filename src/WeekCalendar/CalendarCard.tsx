import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  CardMedia,
  Grid2,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions
} from "@mui/material";
import { RecipeData } from "../Types.js";
import { useApplicationContext } from "../Components/ApplicationContext/useApplicationContext.js";
import { LinkOff } from "@mui/icons-material";
import { Moment } from "moment";
import { useNavigate } from "react-router-dom";

interface CalendarCardProps {
  recipe: RecipeData;
  day: Moment;
  handleUnlink: (id: string, day: Date) => void;
  onLeftoverAdded?: () => void;
}

const CalendarCard: React.FC<CalendarCardProps> = ({
  recipe,
  day,
  handleUnlink,
  onLeftoverAdded
}) => {
  const { fetchAuthenticatedImage, apiFetch, confirm, showError, user } = useApplicationContext();
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [openLeftoverDialog, setOpenLeftoverDialog] = useState(false);
  const [portionText, setPortionText] = useState('');
  const [adding, setAdding] = useState(false);
  const [leftoverCount, setLeftoverCount] = useState<number>(0);

  useEffect(() => {
    const fetchImage = async () => {
      const image = await fetchAuthenticatedImage(
        `/api/recipes/${recipe._id}/image`
      );
      setImageUrl(image);
    };
    fetchImage();
  }, [recipe._id, fetchAuthenticatedImage]);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        if (!recipe._id) return;
        const res = await apiFetch(`/api/leftovers?recipeId=${recipe._id}`, 'GET');
        if (Array.isArray(res)) {
          setLeftoverCount(res.length);
        } else if (res && res.data && Array.isArray(res.data)) {
          setLeftoverCount(res.data.length);
        } else if (res && Array.isArray(res.items)) {
          setLeftoverCount(res.items.length);
        } else {
          // fallback if APIFetch returns object
          setLeftoverCount((res && res.length) || 0);
        }
      } catch (err) {
        // ignore errors for count
        setLeftoverCount(0);
      }
    };
    fetchCount();
  }, [recipe._id, apiFetch]);

  const handleClick = (day: Moment) => {
    if (recipe._id) {
      handleUnlink(recipe._id, day.toDate());
    }
  };

  const handleDouble = () => {
    if (recipe.isLeftover) {
      navigate('/leftovers');
    } else if (recipe._id) {
      navigate(`/recipe/${recipe._id}`);
    }
  }

  const openAddLeftover = () => {
    if (!user) {
      showError('Not authenticated');
      return;
    }
    setPortionText('');
    setOpenLeftoverDialog(true);
  };

  const closeAddLeftover = () => {
    setOpenLeftoverDialog(false);
    setPortionText('');
  };

  const submitLeftover = async () => {
    try {
      const ok = await confirm('Add leftover to freezer?');
      if (!ok) { closeAddLeftover(); return; }
      setAdding(true);
      await apiFetch('/api/leftovers', 'POST', { recipeId: recipe._id, portion: portionText });
      // refresh local count
      try {
        const res2 = await apiFetch(`/api/leftovers?recipeId=${recipe._id}`, 'GET');
        if (Array.isArray(res2)) setLeftoverCount(res2.length);
        else if (res2 && res2.data && Array.isArray(res2.data)) setLeftoverCount(res2.data.length);
      } catch (e) {
        // ignore
      }
      setAdding(false);
      closeAddLeftover();
      if (onLeftoverAdded) onLeftoverAdded();
    } catch (err) {
      setAdding(false);
      showError(err);
    }
  };

  return (
    <>
    <Card style={{ marginTop: '16px' }} onDoubleClick={handleDouble}>
      <Grid2 container>
        <Grid2 size={{ xs: 4 }}>
          <CardMedia
            component="img"
            height="140"
            image={imageUrl}
            alt={recipe.name}
            sx={{ width: "100%", objectFit: "cover" }} // Ensure the image covers the area
          />
        </Grid2>
        <Grid2 size={{ xs: 8 }} sx={{ position: "relative" }}>
          <CardContent>
            <Button
              onClick={() => handleClick(day)}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                zIndex: 1
              }}
            >
              <LinkOff />
            </Button>
            <Button
              onClick={openAddLeftover}
              sx={{
                position: "absolute",
                top: 8,
                right: 56,
                zIndex: 1
              }}
              variant="outlined"
            >
              Add Leftover
            </Button>
            <Typography variant="h6" sx={{ marginTop: '25px' }}>
              {recipe.name}
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', marginTop: '4px' }}>
              In freezer: {leftoverCount}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {recipe.description}
            </Typography>
          </CardContent>
        </Grid2>
      </Grid2>
    </Card>

    <Dialog open={openLeftoverDialog} onClose={closeAddLeftover}>
      <DialogTitle>Add leftover to freezer</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Portion description"
          type="text"
          fullWidth
          value={portionText}
          onChange={(e) => setPortionText(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={closeAddLeftover}>Cancel</Button>
        <Button onClick={submitLeftover} disabled={adding} variant="contained">Add</Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default CalendarCard;

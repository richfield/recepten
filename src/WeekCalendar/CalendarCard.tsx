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
  DialogActions,
  Box
} from "@mui/material";
import { RecipeData } from "../Types.js";
import { useApplicationContext } from "../Components/ApplicationContext/useApplicationContext.js";
import { translate } from "../utils.js";
import { LinkOff } from "@mui/icons-material";
import { Moment } from "moment";
import moment from 'moment';
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
  const { fetchAuthenticatedImage, apiFetch, confirm, showError, user, language } = useApplicationContext();
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [openLeftoverDialog, setOpenLeftoverDialog] = useState(false);
  const [portionText, setPortionText] = useState('');
  const [adding, setAdding] = useState(false);
  const [leftoverCount, setLeftoverCount] = useState<number>(0);
  const [claimedList, setClaimedList] = useState<any[]>([]);

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
    const fetchCountAndClaims = async () => {
      try {
        if (!recipe._id) return;
        // fetch inFreezer count
        const res = await apiFetch<any[]>(`/api/leftovers?recipeId=${recipe._id}&status=inFreezer`, 'GET');
        const data = res?.data ?? [];
        if (Array.isArray(data)) {
          setLeftoverCount(data.length);
        } else {
          setLeftoverCount(0);
        }

        // fetch claimed on this day
        const dateStr = day.format('YYYY-MM-DD');
        const res2 = await apiFetch<any[]>(`/api/leftovers?recipeId=${recipe._id}&status=claimed&date=${dateStr}`, 'GET');
        const claimed = res2?.data ?? [];
        if (Array.isArray(claimed)) {
          setClaimedList(claimed);
        } else {
          setClaimedList([]);
        }
      } catch (err) {
        // ignore errors for count/claims
        setLeftoverCount(0);
        setClaimedList([]);
      }
    };
    fetchCountAndClaims();
  }, [recipe._id, apiFetch, day]);

  const handleClick = (day: Moment) => {
    if (recipe._id) {
      handleUnlink(recipe._id, day.toDate());
    }
  };

  const handleDouble = () => {
    if (recipe.isLeftover) {
      navigate(`/leftovers?recipeId=${recipe._id}`);
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
        const res2 = await apiFetch<any[]>(`/api/leftovers?recipeId=${recipe._id}`, 'GET');
        const data2 = res2?.data ?? [];
        if (Array.isArray(data2)) setLeftoverCount(data2.length);
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
            {recipe.isLeftover ? (
              <Button
                onClick={() => navigate(`/leftovers?recipeId=${recipe._id}`)}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 56,
                  zIndex: 1
                }}
                variant="outlined"
              >
              {translate('viewFreezer', language)}
              </Button>
            ) : (
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
              {translate('addLeftover', language)}
              </Button>
            )}
            <Typography variant="h6" sx={{ marginTop: '25px' }}>
              {recipe.name}
            </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', marginTop: '4px' }}>
                      {translate('inFreezer', language)} {leftoverCount}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {recipe.description}
            </Typography>
            {recipe.isLeftover && claimedList.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2">Claims on this day:</Typography>
                {claimedList.map((c) => (
                  <Typography key={c._id} variant="caption" display="block">
                    {c.portion || ''} — {translate('addedBy', language)} {c.claimedBy || 'Unknown'} ({moment(c.claimedAt).format('LLL')})
                  </Typography>
                ))}
              </Box>
            )}
          </CardContent>
        </Grid2>
      </Grid2>
    </Card>

    <Dialog open={openLeftoverDialog} onClose={closeAddLeftover}>
      <DialogTitle>{translate('addLeftover', language)}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label={translate('portion', language)}
          type="text"
          fullWidth
          value={portionText}
          onChange={(e) => setPortionText(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={closeAddLeftover}>{translate('Cancel', language)}</Button>
        <Button onClick={submitLeftover} disabled={adding} variant="contained">{translate('add', language)}</Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default CalendarCard;

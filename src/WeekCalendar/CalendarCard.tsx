import React, { useCallback, useEffect, useState } from "react";
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
import { Rating } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { RecipeData, LeftoverData, RecipeRatingSummary, RecipeRatingEntry } from "../Types.js";
import { CheckCircle, Add } from '@mui/icons-material';
import { IconButton, Tooltip, Avatar } from '@mui/material';
import { useApplicationContext } from "../Components/ApplicationContext/useApplicationContext.js";
import { translate } from "../utils.js";
import { LinkOff } from "@mui/icons-material";
import type { Moment } from "moment";
import { useNavigate } from "react-router-dom";

interface CalendarCardProps {
  recipe: RecipeData;
  day: Moment;
  handleUnlink: (id: string, day: Date) => void;
  onLeftoverAdded?: () => void;
}

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

const CalendarCard: React.FC<CalendarCardProps> = ({
  recipe,
  day,
  handleUnlink,
  onLeftoverAdded
}) => {
  const { fetchAuthenticatedImage, apiFetch, confirm, showError, showMessage, user, language, getProfileNames } = useApplicationContext();
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [openLeftoverDialog, setOpenLeftoverDialog] = useState(false);
  const [portionText, setPortionText] = useState('');
  const [adding, setAdding] = useState(false);
  const [leftoverCount, setLeftoverCount] = useState<number>(0);
  const [displayList, setDisplayList] = useState<LeftoverData[]>([]);
  const [ratingSummary, setRatingSummary] = useState<RecipeRatingSummary>({ average: 0, count: 0, total: 0, ratings: [] });
  const [userRating, setUserRating] = useState<number | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      const image = await fetchAuthenticatedImage(
        `/api/recipes/${recipe._id}/image`
      );
      setImageUrl(image);
    };
    fetchImage();
  }, [recipe._id, fetchAuthenticatedImage]);

  const fetchCountAndClaims = useCallback(async () => {
    try {
      if (!recipe._id) return;
      // fetch inFreezer count
      const res = await apiFetch<LeftoverData[]>(`/api/leftovers?recipeId=${recipe._id}&status=inFreezer`, 'GET');
      const data = res?.data ?? [];
      if (Array.isArray(data)) {
        setLeftoverCount(data.length);
      } else {
        setLeftoverCount(0);
      }

      // fetch claimed on this day using start/end ISO to avoid timezone issues
      const startISO = day.clone().startOf('day').toISOString();
      const endISO = day.clone().endOf('day').toISOString();
      const res2 = await apiFetch<LeftoverData[]>(`/api/leftovers?status=claimed&start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`, 'GET');
      const claimed = res2?.data ?? [] as LeftoverData[];
      let claimedWithNames: LeftoverData[] = [];
      if (Array.isArray(claimed) && claimed.length > 0) {
        // resolve user display names via profile batch
        const uids = Array.from(new Set(claimed.map((c: LeftoverData) => c.claimedBy).filter(Boolean))) as string[];
        if (uids.length > 0) {
          try {
            const profileMap = await getProfileNames(uids);
            claimedWithNames = claimed.map((c: LeftoverData) => ({ ...c, claimedByName: profileMap[c.claimedBy || '']?.displayName, claimedByPhoto: profileMap[c.claimedBy || '']?.photoURL }));
          } catch {
            claimedWithNames = claimed as LeftoverData[];
          }
        } else {
          claimedWithNames = claimed as LeftoverData[];
        }
      }
      // Show all current freezer items and items claimed for this calendar day.
      const resIn = await apiFetch<LeftoverData[]>(`/api/leftovers?status=inFreezer`, 'GET');
      const dataIn = resIn?.data ?? [] as LeftoverData[];
      const combined: LeftoverData[] = Array.isArray(dataIn) ? [...dataIn] : [];
      // Then add claimed items for the day (avoid duplicates by _id)
      const seen = new Set(combined.map(i => i._id));
      claimedWithNames.forEach((c) => {
        if (!seen.has(c._id)) combined.push(c);
      });
      setDisplayList(combined);
    } catch {
      // ignore errors for count/claims
      setLeftoverCount(0);
      setDisplayList([]);
    }
  }, [apiFetch, day, getProfileNames, recipe._id]);

  useEffect(() => {
    fetchCountAndClaims();
  }, [fetchCountAndClaims]);

  useEffect(() => {
    const fetchRatings = async () => {
      if (!recipe._id) {
        return;
      }

      try {
        const [summaryResponse, myRatingResponse] = await Promise.all([
          apiFetch<RecipeRatingSummary>(`/api/ratings/recipe/${recipe._id}/ratings`, 'GET'),
          apiFetch<RecipeRatingEntry | null>(`/api/ratings/recipe/${recipe._id}/my-rating`, 'GET').catch(() => ({ data: null })),
        ]);

        setRatingSummary(summaryResponse.data ?? { average: 0, count: 0, total: 0, ratings: [] });
        setUserRating(myRatingResponse.data?.value ?? null);
      } catch (error) {
        console.error('Error loading recipe ratings:', error);
      }
    };

    fetchRatings();
  }, [apiFetch, recipe._id, user?.uid]);

  const handleRatingChange = async (_event: React.SyntheticEvent<Element, Event>, value: number | null) => {
    if (!recipe._id || !user || value === null) {
      return;
    }

    try {
      setUserRating(value);
      await apiFetch(`/api/ratings/recipe/${recipe._id}/rating`, 'POST', { value });
      const response = await apiFetch<RecipeRatingSummary>(`/api/ratings/recipe/${recipe._id}/ratings`, 'GET');
      setRatingSummary(response.data ?? { average: 0, count: 0, total: 0, ratings: [] });
    } catch (error) {
      setUserRating(null);
      showError(error);
    }
  };

  const handleClick = (day: Moment) => {
    if (recipe._id) {
      handleUnlink(recipe._id, day.toDate());
    }
  };

  const handleDouble = () => {
    if (recipe.isLeftover) {
      navigate(`/leftovers?recipeId=${recipe._id}&date=${encodeURIComponent(day.format('YYYY-MM-DD'))}`);
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
      const ok = await confirm(translate('addLeftoverConfirm', language));
      if (!ok) { closeAddLeftover(); return; }
      setAdding(true);
      await apiFetch('/api/leftovers', 'POST', { recipeId: recipe._id, portion: portionText });
      // refresh local count
      try {
        const res2 = await apiFetch<LeftoverData[]>(`/api/leftovers?recipeId=${recipe._id}`, 'GET');
        const data2 = res2?.data ?? [];
        if (Array.isArray(data2)) setLeftoverCount(data2.length);
      } catch {
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
              {/* Remove 'View Freezer' button because the card already shows freezer contents */}
              {!recipe.isLeftover && (
                <Tooltip title={translate('addLeftover', language)}>
                  <IconButton
                    onClick={openAddLeftover}
                    color="primary"
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 56,
                      zIndex: 1
                    }}
                    size="small"
                  >
                    <Add />
                  </IconButton>
                </Tooltip>
              )}
              <Typography variant="h6" sx={{ marginTop: '25px' }}>
                {recipe.name}
              </Typography>
              {!recipe.isLeftover && (
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', marginTop: '4px' }}>
                  {translate('inFreezer', language)} {leftoverCount}
                </Typography>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                <Rating value={ratingSummary.average || 0} precision={0.5} readOnly size="small" sx={ratingStyles} />
                <Typography variant="caption" color="textSecondary">{ratingSummary.count ? Number.isInteger(ratingSummary.average) ? ratingSummary.average.toString() : ratingSummary.average.toFixed(1) : '0'} / 5</Typography>
              </Box>
              {user && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="textSecondary">Your rating</Typography>
                  <Rating value={userRating ?? 0} precision={0.5} onChange={handleRatingChange} size="small" sx={ratingStyles} />
                </Box>
              )}
              <Typography variant="body2" color="textSecondary">
                {recipe.description}
              </Typography>
              {recipe.isLeftover && displayList.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2">{translate('freezerItems', language)}</Typography>
                  {displayList.map((c) => (
                    <Box key={c._id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ flex: 1 }}>
                        {c.recipe?.name || recipe.name} {c.portion || ''}
                      </Typography>

                      {/* Show claimant avatar instead of name when claimed */}
                      {/* Claimed avatar: clickable to unclaim if it's the current user's claim, otherwise just show avatar with tooltip */}
                      {!c.inFreezer && (
                        user && c.claimedBy === user.uid ? (
                          <Tooltip title={translate('unclaimClick', language)}>
                            <Avatar
                              src={c.claimedByPhoto}
                              alt={c.claimedByName || ''}
                              sx={{ width: 28, height: 28, cursor: 'pointer' }}
                              onClick={async () => {
                                const ok = await confirm(translate('unclaimConfirm', language));
                                if (!ok) return;
                                try {
                                  await apiFetch(`/api/leftovers/${c._id}/unclaim`, 'POST');
                                  fetchCountAndClaims();
                                  if (onLeftoverAdded) onLeftoverAdded();
                                  // show non-blocking success message
                                  try { showMessage(translate('unclaimSuccess', language)); } catch { /* ignore */ }
                                } catch (e) {
                                  showError(e);
                                }
                              }}
                            >
                              {(!c.claimedByPhoto && c.claimedByName) ? (c.claimedByName.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()) : null}
                            </Avatar>
                          </Tooltip>
                        ) : (
                          <Tooltip title={c.claimedByName || ''}>
                            <Avatar
                              src={c.claimedByPhoto}
                              alt={c.claimedByName || ''}
                              sx={{ width: 28, height: 28 }}
                            >
                              {(!c.claimedByPhoto && c.claimedByName) ? (c.claimedByName.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()) : null}
                            </Avatar>
                          </Tooltip>
                        )
                      )}

                      {/* Claim button for in-freezer items */}
                      {c.inFreezer && (
                        <Tooltip title={translate('claim', language)}>
                          <IconButton size="small" onClick={async () => {
                            if (!user) { showError('Not authenticated'); return; }
                            const ok = await confirm(translate('claimConfirm', language));
                            if (!ok) return;
                            try {
                              await apiFetch(`/api/leftovers/${c._id}/claim`, 'POST', JSON.stringify({ day }));
                              // refresh list
                              fetchCountAndClaims();
                              if (onLeftoverAdded) onLeftoverAdded();
                              try { showMessage(translate('claimSuccess', language)); } catch { /* ignore */ }
                            } catch (e) {
                              showError(e);
                            }
                          }}>
                            <CheckCircle color="success" />
                          </IconButton>
                        </Tooltip>
                      )}

                    </Box>
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

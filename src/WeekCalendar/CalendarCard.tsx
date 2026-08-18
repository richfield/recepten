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
import { RecipeData, LeftoverData, ProfileInfo } from "../Types.js";
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
  const [displayList, setDisplayList] = useState<LeftoverData[]>([]);

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

        // fetch claimed on this day using start/end ISO to avoid timezone issues
        const startISO = day.clone().startOf('day').toISOString();
        const endISO = day.clone().endOf('day').toISOString();
        const res2 = await apiFetch<LeftoverData[]>(`/api/leftovers?recipeId=${recipe._id}&status=claimed&start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`, 'GET');
        const claimed = res2?.data ?? [] as LeftoverData[];
        let claimedWithNames: LeftoverData[] = [];
        if (Array.isArray(claimed) && claimed.length > 0) {
          // resolve user display names via profile batch
          const uids = Array.from(new Set(claimed.map((c: LeftoverData) => c.claimedBy).filter(Boolean))) as string[];
          if (uids.length > 0) {
            try {
              const profilesRes = await apiFetch<ProfileInfo[]>(`/api/profile/batch?uids=${uids.join(',')}`, 'GET');
              const profiles = profilesRes.data || [];
              const nameMap: Record<string, string> = {};
              profiles.forEach((p: ProfileInfo) => { nameMap[p.uid] = p.displayName || p.email || p.uid; });
              claimedWithNames = claimed.map((c: LeftoverData) => ({ ...c, claimedByName: nameMap[c.claimedBy || ''] }));
            } catch (e) {
              claimedWithNames = claimed as LeftoverData[];
            }
          } else {
            claimedWithNames = claimed as LeftoverData[];
          }
        }

        // Combine inFreezer items with claimed items for display; include claimed items even though not in freezer
        const combined: LeftoverData[] = [];
        // fetch inFreezer items explicitly
        const resIn = await apiFetch<LeftoverData[]>(`/api/leftovers?recipeId=${recipe._id}&status=inFreezer`, 'GET');
        const dataIn = resIn?.data ?? [] as LeftoverData[];
        if (Array.isArray(dataIn)) {
          combined.push(...dataIn);
        }
        // Then add claimed items for the day (avoid duplicates by _id)
        const seen = new Set(combined.map(i => i._id));
        claimedWithNames.forEach((c) => {
          if (!seen.has(c._id)) combined.push(c);
        });
        setDisplayList(combined);
      } catch (err) {
        // ignore errors for count/claims
        setLeftoverCount(0);
        setDisplayList([]);
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
            {recipe.isLeftover && displayList.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2">{translate('freezerItems', language)}</Typography>
                {displayList.map((c) => (
                  <Typography key={c._id} variant="caption" display="block">
                    {c.portion || ''} — {c.inFreezer ? translate('inFreezer', language) : translate('claimed', language)} {c.inFreezer ? `(${translate('addedBy', language)} ${c.addedBy || 'Unknown'})` : `(${translate('addedBy', language)} ${c.claimedByName || c.claimedBy || 'Unknown'})`} {c.claimedAt ? `- ${moment(c.claimedAt).format('LLL')}` : ''}
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

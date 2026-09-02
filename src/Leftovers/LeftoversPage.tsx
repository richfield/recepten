import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography, IconButton, Card, CardContent, CardMedia, Grid, Tooltip, Avatar } from '@mui/material';
import { CheckCircle, DeleteForever } from '@mui/icons-material';
import { useApplicationContext } from '../Components/ApplicationContext/useApplicationContext.js';
import moment from 'moment';
import { useLocation } from 'react-router-dom';
import { translate } from '../utils.js';
import { LeftoverData, RecipeData } from '../Types.js';

const LeftoversPage: React.FC = () => {
  const { apiFetch, confirm, showError, showMessage, user, language, getProfileNames, isAdmin } = useApplicationContext();
  const [leftovers, setLeftovers] = useState<LeftoverData[]>([]);
  const [recipe, setRecipe] = useState<RecipeData | null>(null);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const recipeId = params.get('recipeId');
  const linkedDate = params.get('date');

  const fetchRecipe = useCallback(async () => {
    if (!recipeId || !user) {
      setRecipe(null);
      return;
    }

    try {
      const res = await apiFetch<RecipeData>(`/api/recipes/get/${recipeId}`, 'GET');
      setRecipe(res.data ?? null);
    } catch (err) {
      console.error('Error fetching recipe for leftovers page:', err);
      setRecipe(null);
    }
  }, [apiFetch, recipeId, user]);

  const fetchLeftovers = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let items: LeftoverData[] = [];

      if (recipeId) {
        const freezerRes = await apiFetch<LeftoverData[]>('/api/leftovers?status=inFreezer', 'GET');
        const date = linkedDate ? moment(linkedDate, 'YYYY-MM-DD') : moment();
        const startISO = date.clone().startOf('day').toISOString();
        const endISO = date.clone().endOf('day').toISOString();
        const claimedRes = await apiFetch<LeftoverData[]>(
          `/api/leftovers?status=claimed&start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`,
          'GET'
        );

        const freezerItems = freezerRes.data || [];
        const claimedTodayItems = claimedRes.data || [];

        items = [...freezerItems, ...claimedTodayItems];
      } else {
        const res = await apiFetch<LeftoverData[]>('/api/leftovers?status=inFreezer', 'GET');
        items = res.data || [];
      }

      const claimedUids = Array.from(new Set(items.filter(i => !i.inFreezer && i.claimedBy).map(i => i.claimedBy as string)));
      if (claimedUids.length > 0) {
        try {
          const profileMap = await getProfileNames(claimedUids);
          items = items.map(i => ({ ...i, claimedByName: i.claimedBy ? profileMap[i.claimedBy as string]?.displayName : undefined, claimedByPhoto: i.claimedBy ? profileMap[i.claimedBy as string]?.photoURL : undefined }));
        } catch {
          // ignore name lookup failures
        }
      }

      setLeftovers(items as LeftoverData[]);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  }, [apiFetch, getProfileNames, linkedDate, recipeId, showError, user]);

  useEffect(() => {
    fetchLeftovers();
    fetchRecipe();
  }, [fetchLeftovers, fetchRecipe]);

  const handleClaim = async (id: string) => {
    if (!(await confirm(translate('claimConfirm', language)))) return;
    try {
      await apiFetch(`/api/leftovers/${id}/claim`, 'POST');
      await fetchLeftovers();
      try { showMessage(translate('claimSuccess', language)); } catch { /* ignore */ }
    } catch (err) {
      showError(err);
    }
  };

  const handleUnclaim = async (id: string) => {
    if (!(await confirm(translate('unclaimConfirm', language)))) return;
    try {
      await apiFetch(`/api/leftovers/${id}/unclaim`, 'POST');
      await fetchLeftovers();
      try { showMessage(translate('unclaimSuccess', language)); } catch { /* ignore */ }
    } catch (err) {
      showError(err);
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      {recipe && (
        <Card sx={{ mb: 3 }}>
          <Grid container>
            <Grid item xs={4} md={3}>
              <CardMedia
                component="img"
                image={recipe.images?.[0] || '/default.jpg'}
                alt={recipe.name}
                sx={{ width: '100%', height: 180, objectFit: 'cover' }}
              />
            </Grid>
            <Grid item xs={8} md={9}>
              <CardContent>
                <Typography variant="h5" gutterBottom>{recipe.name}</Typography>
                {recipe.description && (
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    {recipe.description}
                  </Typography>
                )}
                <Typography variant="caption" color="textSecondary">
                  {translate('leftoversInFreezer', language)}
                </Typography>
              </CardContent>
            </Grid>
          </Grid>
        </Card>
      )}

      <Typography variant="h5" gutterBottom>
        {translate('leftoversInFreezer', language)}
      </Typography>
      {loading && <Typography>{translate('loading', language)}</Typography>}
      {leftovers.length === 0 && !loading && (
        <Typography>{translate('noLeftovers', language)}</Typography>
      )}
      <Grid container spacing={2}>
        {leftovers.map((l) => (
          <Grid item xs={12} md={6} key={l._id}>
            <Card>
              <Grid container>
                <Grid item xs={4}>
                  <CardMedia
                    component="img"
                    image={l.recipe?.images?.[0] || '/default.jpg'}
                    alt={l.recipe?.name}
                    sx={{ width: '100%', height: 120, objectFit: 'cover' }}
                  />
                </Grid>
                <Grid item xs={8}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6">{l.recipe?.name}</Typography>
                      <Typography variant="body2">{l.portion || translate('portion', language)}</Typography>
                      <Typography variant="caption" display="block">{translate('addedAt', language)} {moment(l.addedAt).format('LL')}</Typography>
                      {/* If claimed, show claimant name and avatar */}
                      {!l.inFreezer && l.claimedByName && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" display="block">{l.claimedByName}</Typography>
                          {l.claimedBy && (
                            user && l.claimedBy === user.uid ? (
                              <Tooltip title={translate('unclaimClick', language)}>
                                <Avatar
                                  src={l.claimedByPhoto}
                                  alt={l.claimedByName || ''}
                                  sx={{ width: 28, height: 28, cursor: 'pointer' }}
                                  onClick={() => handleUnclaim(l._id)}
                                />
                              </Tooltip>
                            ) : (
                              <Tooltip title={l.claimedByName || ''}>
                                <Avatar
                                  src={l.claimedByPhoto}
                                  alt={l.claimedByName || ''}
                                  sx={{ width: 28, height: 28 }}
                                />
                              </Tooltip>
                            )
                          )}
                        </Box>
                      )}
                    </Box>

                    {/* Actions: claim if inFreezer */}
                    {l.inFreezer && (
                      <Tooltip title={translate('claim', language)}>
                        <IconButton color="primary" onClick={() => handleClaim(l._id)}>
                          <CheckCircle />
                        </IconButton>
                      </Tooltip>
                    )}

                    {/* Admin remove */}
                    {isAdmin && (
                      <Tooltip title={translate('remove', language)}>
                        <IconButton color="error" onClick={async () => {
                          const ok = await confirm(translate('removeConfirm', language));
                          if (!ok) return;
                          try {
                            await apiFetch(`/api/leftovers/${l._id}`, 'DELETE');
                            await fetchLeftovers();
                            try { showMessage(translate('removeSuccess', language)); } catch { /* ignore */ }
                          } catch (err) {
                            showError(err);
                          }
                        }}>
                          <DeleteForever />
                        </IconButton>
                      </Tooltip>
                    )}

                  </CardContent>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default LeftoversPage;

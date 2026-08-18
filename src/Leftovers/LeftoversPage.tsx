import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, Card, CardContent, CardMedia, Grid, Tooltip } from '@mui/material';
import { CheckCircle, Undo } from '@mui/icons-material';
import { useApplicationContext } from '../Components/ApplicationContext/useApplicationContext.js';
import moment from 'moment';
import { useLocation } from 'react-router-dom';
import { translate } from '../utils.js';
import { LeftoverData } from '../Types.js';

const LeftoversPage: React.FC = () => {
  const { apiFetch, confirm, showError, user, language, getProfileNames } = useApplicationContext();
  const [leftovers, setLeftovers] = useState<LeftoverData[]>([]);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const recipeId = params.get('recipeId');

  const fetchLeftovers = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Request all leftovers (both inFreezer and claimed) for the optional recipeId
      const url = recipeId ? `/api/leftovers?recipeId=${encodeURIComponent(recipeId)}&status=all` : '/api/leftovers?status=all';
      const res = await apiFetch<LeftoverData[]>(url, 'GET');
      let items = res.data || [];

      // Resolve claimant display names for claimed items so we can show names for others
      const claimedUids = Array.from(new Set(items.filter(i => !i.inFreezer && i.claimedBy).map(i => i.claimedBy as string)));
      if (claimedUids.length > 0) {
        try {
          const nameMap = await getProfileNames(claimedUids);
          items = items.map(i => ({ ...i, claimedByName: i.claimedBy ? nameMap[i.claimedBy as string] : undefined }));
        } catch (e) {
          // ignore name lookup failures
        }
      }

      setLeftovers(items as LeftoverData[]);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeftovers();
  }, [recipeId, user]);

  const handleClaim = async (id: string) => {
    if (!(await confirm(translate('claimConfirm', language)))) return;
    try {
      await apiFetch(`/api/leftovers/${id}/claim`, 'POST');
      await fetchLeftovers();
    } catch (err) {
      showError(err);
    }
  };

  const handleUnclaim = async (id: string) => {
    if (!(await confirm(translate('unclaimConfirm', language)))) return;
    try {
      await apiFetch(`/api/leftovers/${id}/unclaim`, 'POST');
      await fetchLeftovers();
    } catch (err) {
      showError(err);
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
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
                      {/* If claimed, show claimant name */}
                      {!l.inFreezer && l.claimedByName && (
                        <Typography variant="caption" display="block">{l.claimedByName}</Typography>
                      )}
                    </Box>

                    {/* Actions: claim if inFreezer, unclaim only if claimed by current user */}
                    {l.inFreezer ? (
                      <Tooltip title={translate('claim', language)}>
                        <IconButton color="primary" onClick={() => handleClaim(l._id)}>
                          <CheckCircle />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      user && l.claimedBy === user.uid ? (
                        <Tooltip title={translate('unclaim', language)}>
                          <IconButton color="inherit" onClick={() => handleUnclaim(l._id)}>
                            <Undo />
                          </IconButton>
                        </Tooltip>
                      ) : null
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

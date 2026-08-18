import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Card, CardContent, CardMedia, Grid } from '@mui/material';
import { useApplicationContext } from '../Components/ApplicationContext/useApplicationContext.js';
import moment from 'moment';
import { useLocation } from 'react-router-dom';
import { translate } from '../utils.js';
import { LeftoverData } from '../Types.js';

const LeftoversPage: React.FC = () => {
  const { apiFetch, confirm, showError, user, language } = useApplicationContext();
  const [leftovers, setLeftovers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const recipeId = params.get('recipeId');

  const fetchLeftovers = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const url = recipeId ? `/api/leftovers?recipeId=${recipeId}` : '/api/leftovers';
      const res = await apiFetch<LeftoverData[]>(url, 'GET');
      setLeftovers(res.data || []);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeftovers();
  }, []);

  const handleClaim = async (id: string) => {
    if (!(await confirm('Claim this leftover?'))) return;
    try {
      await apiFetch(`/api/leftovers/${id}/claim`, 'POST');
      // remove from list
      setLeftovers((prev) => prev.filter((l) => l._id !== id));
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
                  <CardContent>
                    <Typography variant="h6">{l.recipe?.name}</Typography>
                    <Typography variant="body2">{l.portion || translate('portion', language)}</Typography>
                    <Typography variant="caption" display="block">{translate('addedBy', language)} {l.addedBy || 'Unknown'}</Typography>
                    <Typography variant="caption" display="block">{translate('addedAt', language)} {moment(l.addedAt).format('LLL')}</Typography>
                    <Box sx={{ mt: 1 }}>
                      <Button variant="contained" color="primary" onClick={() => handleClaim(l._id)}>
                        {translate('claim', language)}
                      </Button>
                    </Box>
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

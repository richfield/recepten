import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Card, CardContent, CardMedia, Grid } from '@mui/material';
import { useApplicationContext } from '../Components/ApplicationContext/useApplicationContext.js';
import moment from 'moment';

const LeftoversPage: React.FC = () => {
  const { apiFetch, confirm, showError, language, user } = useApplicationContext();
  const [leftovers, setLeftovers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLeftovers = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await apiFetch<any[]>('/api/leftovers', 'GET');
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
      const res = await apiFetch(`/api/leftovers/${id}/claim`, 'POST');
      // remove from list
      setLeftovers((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      showError(err);
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Leftovers in freezer
      </Typography>
      {loading && <Typography>Loading...</Typography>}
      {leftovers.length === 0 && !loading && (
        <Typography>No leftovers currently in the freezer.</Typography>
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
                    <Typography variant="body2">{l.portion || 'Portion'}</Typography>
                    <Typography variant="caption" display="block">Added by: {l.addedBy || 'Unknown'}</Typography>
                    <Typography variant="caption" display="block">Added: {moment(l.addedAt).format('LLL')}</Typography>
                    <Box sx={{ mt: 1 }}>
                      <Button variant="contained" color="primary" onClick={() => handleClaim(l._id)}>
                        Claim
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

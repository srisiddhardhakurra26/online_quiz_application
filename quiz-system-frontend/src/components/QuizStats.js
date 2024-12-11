import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchQuizStats } from '../api';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Avatar,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  Assessment,
  Group,
  Score,
  Timeline,
} from '@mui/icons-material';

function QuizStatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { quizId } = useParams();

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchQuizStats(quizId);
        setStats(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load quiz statistics');
        setLoading(false);
      }
    };

    loadStats();
  }, [quizId]);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <CircularProgress />
    </Box>
  );
  
  if (error) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Typography color="error" variant="h6">{error}</Typography>
    </Box>
  );
  
  if (!stats) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Card sx={{ mb: 4, borderRadius: 2, bgcolor: '#f5f5f5' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Assessment sx={{ fontSize: 40, color: '#1976d2' }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              {stats.quizTitle} Statistics
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Attempts Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Group sx={{ fontSize: 40, color: '#2196f3' }} />
                <Typography variant="h6">Total Attempts</Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                  {stats.totalAttempts}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Average Score Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Score sx={{ fontSize: 40, color: '#4caf50' }} />
                <Typography variant="h6">Average Score</Typography>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress
                    variant="determinate"
                    value={stats.averageScore}
                    size={80}
                    thickness={4}
                    sx={{ color: '#4caf50' }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      {stats.averageScore.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Attempts */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Timeline sx={{ fontSize: 30, color: '#673ab7' }} />
            <Typography variant="h6">Recent Attempts</Typography>
          </Box>
          
          {stats.attempts && stats.attempts.length > 0 ? (
            <Grid container spacing={2}>
              {stats.attempts.map((attempt, index) => (
                <Grid item xs={12} key={index}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#673ab7' }}>
                          {attempt.username[0].toUpperCase()}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                            {attempt.username}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={attempt.score}
                              sx={{
                                height: 8,
                                borderRadius: 5,
                                bgcolor: '#e0e0e0',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: attempt.score > 75 ? '#4caf50' : attempt.score > 50 ? '#ff9800' : '#f44336',
                                },
                              }}
                            />
                            <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                              Score: {attempt.score}%
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No attempts have been made yet.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}

export default QuizStatsPage;
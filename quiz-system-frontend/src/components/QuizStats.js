import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchQuizStats } from '../api';
import { Container, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';

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

  if (loading) return <Container><Typography>Loading statistics...</Typography></Container>;
  if (error) return <Container><Typography color="error">{error}</Typography></Container>;
  if (!stats) return null;

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        {stats.quizTitle} Statistics
      </Typography>
      <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
        <Typography variant="h6">Overall Stats</Typography>
        <Typography>Total Attempts: {stats.totalAttempts}</Typography>
        <Typography>Average Score: {stats.averageScore.toFixed(2)}</Typography>
      </Paper>
      <Typography variant="h6">Recent Attempts</Typography>
      {stats.attempts && stats.attempts.length > 0 ? (
        <List>
          {stats.attempts.map((attempt, index) => (
            <ListItem key={index} divider>
              <ListItemText 
                primary={`Attempted by: ${attempt.username}`} 
                secondary={`Score: ${attempt.score}`} 
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography>No attempts have been made yet.</Typography>
      )}
    </Container>
  );
}

export default QuizStatsPage;
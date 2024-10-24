import React, { useState, useEffect, useCallback } from 'react';
import { getUserAttemptDetails, getQuizById } from '../api';
import { Typography, List, ListItem, ListItemText, Paper, Container } from '@mui/material';

function UserDashboard() {
  const [userDetails, setUserDetails] = useState(null);
  const userId = localStorage.getItem('userId');

  const addQuizDetailsToAttempts = useCallback(async (details) => {
    const updatedAttempts = await Promise.all(details.recentAttempts.map(async (attempt) => {
      try {
        const quizData = await getQuizById(attempt.quizId);
        return { 
          ...attempt, 
          quizName: quizData && quizData.title ? quizData.title : 'Unknown Quiz',
          totalQuestions: quizData && quizData.questions ? quizData.questions.length : 0
        };
      } catch (error) {
        console.error('Error fetching quiz details:', error);
        return { ...attempt, quizName: 'Unknown Quiz', totalQuestions: 0 };
      }
    }));
    return { ...details, recentAttempts: updatedAttempts };
  }, []);

  const fetchUserDetails = useCallback(async () => {
    try {
      const response = await getUserAttemptDetails(userId);
      const detailsWithQuizInfo = await addQuizDetailsToAttempts(response.data);
      setUserDetails(detailsWithQuizInfo);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  }, [userId, addQuizDetailsToAttempts]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        User Dashboard
      </Typography>
      {userDetails && (
        <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
          <Typography>
            Total Quizzes Taken: {userDetails.totalQuizzesTaken}
          </Typography>
          
          <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>
            Recent Quiz Attempts
          </Typography>
          <List>
            {userDetails.recentAttempts.map((attempt, index) => (
              <ListItem key={attempt.id || index}>
                <ListItemText 
                  primary={`${attempt.quizName || 'Unknown Quiz'}`}
                  secondary={`Score: ${attempt.score}/${attempt.totalQuestions}, Date: ${new Date(attempt.completedAt).toLocaleString()}`}
                />
              </ListItem>
            ))}
          </List>
          
          <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>
            Created Quizzes
          </Typography>
          <List>
            {userDetails.createdQuizzes.map((quiz) => (
              <ListItem key={quiz.id}>
                <ListItemText primary={quiz.title || 'Untitled Quiz'} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
}

export default UserDashboard;
import React, { useState, useEffect, useCallback } from 'react';
import { getUserAttemptDetails, getQuizById } from '../api';
import {
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Box,
  Avatar,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Create as CreateIcon,
  Timeline as TimelineIcon,
  Star as StarIcon
} from '@mui/icons-material';

function UserDashboard() {
  const [userDetails, setUserDetails] = useState(null);
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  const addQuizDetailsToAttempts = useCallback(async (details) => {
    const updatedAttempts = await Promise.all(details.recentAttempts.map(async (attempt) => {
      try {
        const quizData = await getQuizById(attempt.quizId);
        return { 
          ...attempt, 
          quizName: quizData?.title || 'Unknown Quiz',
          totalQuestions: quizData?.questions?.length || 0
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

  const getScoreColor = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return '#4caf50';
    if (percentage >= 60) return '#ff9800';
    return '#f44336';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* User Profile Section */}
        <Grid item xs={12}>
          <Card sx={{ mb: 4, borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    bgcolor: '#1976d2',
                    fontSize: '2rem'
                  }}
                >
                  {username?.[0]?.toUpperCase()}
                </Avatar>
                <Box sx={{ ml: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {username}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Quiz Master
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssessmentIcon sx={{ fontSize: 40, color: '#1976d2', mr: 2 }} />
                <Typography variant="h6">Total Quizzes Taken</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                {userDetails?.totalQuizzesTaken || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Attempts */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TimelineIcon sx={{ fontSize: 30, color: '#2196f3', mr: 2 }} />
                <Typography variant="h6">Recent Attempts</Typography>
              </Box>
              <Box>
                {userDetails?.recentAttempts.map((attempt, index) => (
                  <Box key={attempt.id || index} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                        {attempt.quizName}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ 
                        color: getScoreColor(attempt.score, attempt.totalQuestions)
                      }}>
                        {attempt.score}/{attempt.totalQuestions}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(attempt.score / attempt.totalQuestions) * 100}
                      sx={{ 
                        height: 8, 
                        borderRadius: 5,
                        bgcolor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: getScoreColor(attempt.score, attempt.totalQuestions)
                        }
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {new Date(attempt.completedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Created Quizzes */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <CreateIcon sx={{ fontSize: 30, color: '#4caf50', mr: 2 }} />
                <Typography variant="h6">Created Quizzes</Typography>
              </Box>
              <Grid container spacing={2}>
                {userDetails?.createdQuizzes.map((quiz) => (
                  <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                    <Card variant="outlined" sx={{ 
                      borderRadius: 2,
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 2
                      }
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                            {quiz.title || 'Untitled Quiz'}
                          </Typography>
                          <Tooltip title="Quiz Rating">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <StarIcon sx={{ color: '#ffc107', fontSize: 20 }} />
                              <Typography variant="body2" sx={{ ml: 0.5 }}>
                                
                              </Typography>
                            </Box>
                          </Tooltip>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default UserDashboard;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllQuizzes, deleteQuiz } from '../api';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  IconButton,
  Tooltip,
  CardHeader,
  Avatar,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
  Search as SearchIcon,
  PlayArrow as PlayArrowIcon
} from '@mui/icons-material';

function Home() {
  const [quizzes, setQuizzes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await getAllQuizzes();
      setQuizzes(response.data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await deleteQuiz(quizId);
        fetchQuizzes();
      } catch (error) {
        console.error('Error deleting quiz:', error);
      }
    }
  };

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRandomColor = () => {
    const colors = ['#1976d2', '#388e3c', '#d32f2f', '#7b1fa2', '#1565c0', '#c62828'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 'bold',
            color: '#1a237e'
          }}
        >
          Quiz Dashboard
        </Typography>
        <Button
          component={Link}
          to="/create-quiz"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 3
          }}
        >
          Create New Quiz
        </Button>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search quizzes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 4 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      <Grid container spacing={3}>
        {filteredQuizzes.map((quiz) => (
          <Grid item xs={12} sm={6} md={4} key={quiz.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: getRandomColor() }}>
                    {quiz.title.charAt(0).toUpperCase()}
                  </Avatar>
                }
                title={quiz.title}
                titleTypographyProps={{ variant: 'h6' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {quiz.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
                <Box>
                  <Tooltip title="Take Quiz">
                    <IconButton
                      component={Link}
                      to={`/take-quiz/${quiz.id}`}
                      color="primary"
                    >
                      <PlayArrowIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View Stats">
                    <IconButton
                      component={Link}
                      to={`/quiz-stats/${quiz.id}`}
                      color="info"
                    >
                      <AssessmentIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                {currentUserId === quiz.creatorId && (
                  <Box>
                    <Tooltip title="Edit Quiz">
                      <IconButton
                        component={Link}
                        to={`/edit-quiz/${quiz.id}`}
                        color="secondary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Quiz">
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteQuiz(quiz.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Home;
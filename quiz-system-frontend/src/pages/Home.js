import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllQuizzes } from '../api';
import { Container, Typography, List, ListItem, ListItemText, Button, Box } from '@mui/material';
import { deleteQuiz } from '../api';

function Home() {
  const [quizzes, setQuizzes] = useState([]);
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
        fetchQuizzes(); // Refresh the quiz list
      } catch (error) {
        console.error('Error deleting quiz:', error);
        alert('Failed to delete quiz. Please try again.');
      }
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Available Quizzes
      </Typography>
      <Button component={Link} to="/create-quiz" variant="contained" color="primary" style={{ marginBottom: '20px' }}>
        Create New Quiz
      </Button>
      <List>
        {quizzes.map((quiz) => (
          <ListItem key={quiz.id} divider>
            <ListItemText primary={quiz.title} secondary={quiz.description} />
            <Box>
              <Button 
                component={Link} 
                to={`/take-quiz/${quiz.id}`} 
                variant="contained" 
                color="primary" 
                style={{ marginRight: '10px' }}
              >
                Take Quiz
              </Button>
              <Button 
                component={Link} 
                to={`/quiz-stats/${quiz.id}`} 
                variant="contained" 
                color="info" 
                style={{ marginRight: '10px' }}
              >
                View Stats
              </Button>
              {currentUserId === quiz.creatorId && (
                <>
                  <Button 
                    component={Link} 
                    to={`/edit-quiz/${quiz.id}`} 
                    variant="contained" 
                    color="secondary"
                    style={{ marginRight: '10px' }}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="contained" 
                    color="error"
                    onClick={() => handleDeleteQuiz(quiz.id)}
                  >
                    Delete
                  </Button>
                </>
              )}
            </Box>
          </ListItem>
        ))}
      </List>
    </Container>
  );
}

export default Home;
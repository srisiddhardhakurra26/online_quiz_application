import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { Container, Typography, List, ListItem, ListItemText, Paper, Box } from '@mui/material';

function QuizResults() {
  const location = useLocation();
  const { quiz, answers, score } = location.state || {};

  if (!quiz || !answers || score === undefined) {
    return <Navigate to="/" replace />;
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Quiz Results: {quiz.title}
      </Typography>
      <Paper elevation={3}>
        <Box p={3}>
          <Typography variant="h5" gutterBottom>
            Your Score: {score} out of {quiz.questions.length}
          </Typography>
          <List>
            {quiz.questions.map((question) => (
              <ListItem key={question.id}>
                <ListItemText
                  primary={question.text}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="textPrimary">
                        Your answer: {question.options[answers[question.id]]}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2" color={answers[question.id] === question.correctOptionIndex ? "primary" : "error"}>
                        Correct answer: {question.options[question.correctOptionIndex]}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Paper>
    </Container>
  );
}

export default QuizResults;
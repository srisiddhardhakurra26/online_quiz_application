import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizById, submitQuiz } from '../api';
import { 
  Container, Typography, Radio, RadioGroup, FormControlLabel, 
  Button, Box, CircularProgress 
} from '@mui/material';

function TakeQuiz() {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      console.log("Submitting answers:", answers);
      const userId = localStorage.getItem('userId');
      const score = await submitQuiz(id, answers, userId);
      console.log("Received score:", score);
      navigate(`/quiz-results/${id}`, { 
        state: { 
          answers: answers, 
          score: score,
          quiz: quiz 
        } 
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError(`Failed to submit quiz. Error: ${error.message}`);
    }
  }, [id, answers, quiz, navigate]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizData = await getQuizById(id);
        setQuiz(quizData);
        if (quizData.timeLimit) {
          setTimeLeft(quizData.timeLimit * 60);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        setError('Failed to load quiz. Please try again.');
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft(time => {
        if (time <= 1) {
          clearInterval(timerId);
          handleSubmit(new Event('submit'));
          return 0;
        }
        return time - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, handleSubmit]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: parseInt(value)
    }));
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!quiz) {
    return <Typography>Quiz not found</Typography>;
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        {quiz.title}
      </Typography>
      <Typography variant="body1" paragraph>
        {quiz.description}
      </Typography>
      {timeLeft !== null && (
        <Typography variant="h6" color={timeLeft < 60 ? "error" : "inherit"}>
          Time Remaining: {formatTime(timeLeft)}
        </Typography>
      )}
      <form onSubmit={handleSubmit}>
      {quiz.questions.map((question) => (
          <Box key={question.id} mb={3}>
            <Typography variant="h6">{question.text}</Typography>
            <RadioGroup
              value={answers[question.id] !== undefined ? answers[question.id].toString() : ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            >
              {question.options.map((option, optionIndex) => (
                <FormControlLabel
                  key={optionIndex}
                  value={optionIndex.toString()}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
          </Box>
        ))}
        <Button type="submit" variant="contained" color="primary">
          Submit Quiz
        </Button>
      </form>
    </Container>
  );
}

export default TakeQuiz;
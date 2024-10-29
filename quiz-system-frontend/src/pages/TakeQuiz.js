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

  // Define saveQuizState first
  const saveQuizState = useCallback((quizData, answerData, timeRemaining) => {
    const stateToSave = {
      quiz: quizData,
      answers: answerData,
      timeLeft: timeRemaining
    };
    localStorage.setItem(`quiz_state_${id}`, JSON.stringify(stateToSave));
  }, [id]);

  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    try {
      console.log("Submitting answers:", answers);
      const userId = localStorage.getItem('userId');
      const score = await submitQuiz(id, answers, userId);
      console.log("Received score:", score);
      
      // Clear saved state on successful submission
      localStorage.removeItem(`quiz_state_${id}`);
      localStorage.removeItem(`quiz_start_${id}`);

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

  // Load saved quiz state
  useEffect(() => {
    const loadSavedState = () => {
      const savedState = localStorage.getItem(`quiz_state_${id}`);
      if (savedState) {
        const { answers: savedAnswers, timeLeft: savedTime, quiz: savedQuiz } = JSON.parse(savedState);
        setAnswers(savedAnswers || {});
        setQuiz(savedQuiz);
        
        // Calculate remaining time
        if (savedTime) {
          const timePassed = (Date.now() - parseInt(localStorage.getItem(`quiz_start_${id}`))) / 1000;
          const remainingTime = Math.max(0, savedTime - timePassed);
          setTimeLeft(Math.floor(remainingTime));
        }
        setLoading(false);
      } else {
        // Fetch quiz if no saved state
        fetchQuiz();
      }
    };

    const fetchQuiz = async () => {
      try {
        const quizData = await getQuizById(id);
        setQuiz(quizData);
        if (quizData.timeLimit) {
          const initialTime = quizData.timeLimit * 60;
          setTimeLeft(initialTime);
          localStorage.setItem(`quiz_start_${id}`, Date.now().toString());
        }
        setLoading(false);
        
        // Save initial quiz state
        saveQuizState(quizData, {}, quizData.timeLimit * 60);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        setError('Failed to load quiz. Please try again.');
        setLoading(false);
      }
    };

    loadSavedState();

    // Cleanup function
    return () => {
      // Don't clear state on normal navigation
      if (!document.hidden) {
        localStorage.removeItem(`quiz_state_${id}`);
        localStorage.removeItem(`quiz_start_${id}`);
      }
    };
  }, [id, saveQuizState]); // Added saveQuizState to dependency array

  // Timer effect
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft(time => {
        const newTime = time - 1;
        if (newTime <= 0) {
          clearInterval(timerId);
          handleSubmit();
          return 0;
        }
        // Save state every second
        saveQuizState(quiz, answers, newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, handleSubmit, quiz, answers, saveQuizState]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId, value) => {
    const newAnswers = {
      ...answers,
      [questionId]: parseInt(value)
    };
    setAnswers(newAnswers);
    // Save state when answer changes
    saveQuizState(quiz, newAnswers, timeLeft);
  };

  // Add beforeunload event listener
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveQuizState(quiz, answers, timeLeft);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [quiz, answers, timeLeft, saveQuizState]);

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
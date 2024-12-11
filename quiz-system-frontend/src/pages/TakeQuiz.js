import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getQuizById, 
  startQuizAttempt,
  getRemainingTime, 
  submitQuizAttempt,
  getUserAttempt
} from '../api';
import { 
  Container, Typography, Radio, RadioGroup, FormControlLabel, 
  Button, Box, CircularProgress, Alert, Paper
} from '@mui/material';

function TakeQuiz() {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [score, setScore] = useState(null);
  const timerRef = useRef(null);
  const initializingRef = useRef(false);
  const { id } = useParams();
  const navigate = useNavigate();

  // Check attempt status first
  useEffect(() => {
    const checkAttemptStatus = async () => {
      try {
        const data = await getUserAttempt(id, localStorage.getItem('userId'));
        if (data.hasAttempted) {
          setHasAttempted(true);
          setScore(data.score);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error checking attempt status:', error);
        if (error.response?.status === 400) {
          setHasAttempted(true);
          setLoading(false);
        }
      }
    };
    checkAttemptStatus();
  }, [id]);

  useEffect(() => {
    const savedAnswers = localStorage.getItem(`quiz_answers_${id}`);
    if (savedAnswers) {
      try {
        setAnswers(JSON.parse(savedAnswers));
      } catch (error) {
        console.error('Error loading saved answers:', error);
        localStorage.removeItem(`quiz_answers_${id}`);
      }
    }
  }, [id]);

  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    try {
      const result = await submitQuizAttempt(attemptId, answers);
      localStorage.removeItem(`quiz_answers_${id}`);
      localStorage.removeItem(`quiz_attempt_${id}`);
      
      navigate(`/quiz-results/${id}`, { 
        state: { 
          answers: answers, 
          score: result.score,
          quiz: quiz 
        } 
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      const errorMessage = error.message || 'An error occurred';
      if (errorMessage.toLowerCase().includes('already attempted') || 
          errorMessage.toLowerCase().includes('no longer active')) {
        setHasAttempted(true);
        localStorage.removeItem(`quiz_answers_${id}`);
        localStorage.removeItem(`quiz_attempt_${id}`);
      } else {
        setError(errorMessage);
      }
    }
  }, [attemptId, answers, id, navigate, quiz]);

  useEffect(() => {
    if (hasAttempted) {
      return; // Don't initialize if already attempted
    }

    const initializeQuiz = async () => {
      if (initializingRef.current) return;
      initializingRef.current = true;

      try {
        const quizData = await getQuizById(id);
        setQuiz(quizData);
        
        const existingAttemptId = localStorage.getItem(`quiz_attempt_${id}`);

        if (existingAttemptId) {
          try {
            const remainingTime = await getRemainingTime(existingAttemptId);
            if (remainingTime > 0) {
              setAttemptId(existingAttemptId);
              setTimeLeft(remainingTime);
              setLoading(false);
              return;
            } else {
              localStorage.removeItem(`quiz_attempt_${id}`);
              localStorage.removeItem(`quiz_answers_${id}`);
              throw new Error('Previous attempt has expired');
            }
          } catch (error) {
            localStorage.removeItem(`quiz_attempt_${id}`);
            localStorage.removeItem(`quiz_answers_${id}`);
          }
        }

        try {
          const attempt = await startQuizAttempt(
            localStorage.getItem('userId'),
            id,
            quizData.timeLimit * 60
          );
          setAttemptId(attempt.id);
          setTimeLeft(quizData.timeLimit * 60);
          localStorage.setItem(`quiz_attempt_${id}`, attempt.id);
        } catch (error) {
          const errorMessage = error.message || 'An error occurred';
          if (errorMessage.toLowerCase().includes('already attempted')) {
            setHasAttempted(true);
            localStorage.removeItem(`quiz_answers_${id}`);
            localStorage.removeItem(`quiz_attempt_${id}`);
          } else {
            throw error;
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error initializing quiz:', error);
        setError(error.message || 'Failed to start quiz');
        setLoading(false);
      } finally {
        initializingRef.current = false;
      }
    };

    initializeQuiz();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id, hasAttempted]);

  useEffect(() => {
    if (timeLeft === null || loading) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeLeft, loading, handleSubmit]);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && attemptId) {
        try {
          const serverTime = await getRemainingTime(attemptId);
          if (serverTime <= 0) {
            setHasAttempted(true);
            localStorage.removeItem(`quiz_answers_${id}`);
            localStorage.removeItem(`quiz_attempt_${id}`);
          } else {
            setTimeLeft(serverTime);
          }
        } catch (error) {
          console.error('Error syncing time:', error);
          const errorMessage = error.message || 'An error occurred';
          if (errorMessage.toLowerCase().includes('already attempted') || 
              errorMessage.toLowerCase().includes('no longer active')) {
            setHasAttempted(true);
            localStorage.removeItem(`quiz_answers_${id}`);
            localStorage.removeItem(`quiz_attempt_${id}`);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [attemptId, id]);

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
    localStorage.setItem(`quiz_answers_${id}`, JSON.stringify(newAnswers));
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (hasAttempted) {
    return (
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            You have already attempted this quiz. Your score: {score !== null ? score : 'Loading...'}
          </Alert>
          <Typography variant="h5" gutterBottom>
            {quiz?.title || 'Quiz'}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/dashboard')}
            sx={{ mt: 2 }}
          >
            Back to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => navigate('/dashboard')}
            sx={{ mt: 2 }}
          >
            Back to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!quiz) {
    return (
      <Container maxWidth="md">
        <Typography sx={{ mt: 4 }}>Quiz not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {quiz.title}
        </Typography>
        <Typography variant="body1" paragraph>
          {quiz.description}
        </Typography>
        {timeLeft !== null && (
          <Typography 
            variant="h6" 
            color={timeLeft < 60 ? "error" : "inherit"}
            sx={{ 
              mb: 3,
              animation: timeLeft < 60 ? 'blink 1s linear infinite' : 'none',
              '@keyframes blink': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.5 },
                '100%': { opacity: 1 }
              }
            }}
          >
            Time Remaining: {formatTime(timeLeft)}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          {quiz.questions.map((question) => (
            <Box 
              key={question.id} 
              sx={{
                mb: 3,
                p: 3,
                borderRadius: 1,
                bgcolor: 'background.paper',
                boxShadow: 1
              }}
            >
              <Typography variant="h6" gutterBottom>
                {question.text}
              </Typography>
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
                    sx={{ mt: 1 }}
                  />
                ))}
              </RadioGroup>
            </Box>
          ))}
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            size="large"
            sx={{ mt: 2 }}
          >
            Submit Quiz
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default TakeQuiz;
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizById, updateQuiz } from '../api';
import {
  Container, Typography, TextField, Button, Box,
  List, ListItem, IconButton, Radio, RadioGroup, FormControlLabel,
  Snackbar, Alert, Switch, FormGroup
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

function EditQuiz() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(false);
const [timeLimit, setTimeLimit] = useState(30);
  const { id } = useParams();
  const navigate = useNavigate();

  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    try {
      const quiz = await getQuizById(id);
      console.log('Fetched quiz:', quiz);
      setTitle(quiz.title);
      setDescription(quiz.description);
      setQuestions(quiz.questions || []);
      setTimerEnabled(quiz.timeLimit != null);
      setTimeLimit(quiz.timeLimit || 30);
      console.log('Set questions:', quiz.questions || []);
    } catch (error) {
      console.error('Error in fetchQuiz:', error);
      setError('Failed to fetch quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', '', '', ''], correctOptionIndex: 0 }]);
  };

  const removeQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const validateQuiz = () => {
    if (!title.trim()) {
      setError('Quiz title is required');
      return false;
    }
    if (questions.length === 0) {
      setError('At least one question is required');
      return false;
    }
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].text.trim()) {
        setError(`Question ${i + 1} text is required`);
        return false;
      }
      for (let j = 0; j < questions[i].options.length; j++) {
        if (!questions[i].options[j].trim()) {
          setError(`All options for Question ${i + 1} must be filled`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateQuiz()) {
      return;
    }
    try {
      const quizData = { 
        id, 
        title, 
        description, 
        questions,
        timeLimit: timerEnabled ? timeLimit : null,
        creatorId: localStorage.getItem('userId') 
      };
      console.log('Submitting quiz data:', quizData);
      const updatedQuiz = await updateQuiz(quizData);
      console.log('Updated quiz:', updatedQuiz);
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Error updating quiz:', error);
      setError('Failed to update quiz. Please try again.');
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Edit Quiz
      </Typography>
      {loading ? (
      <Typography>Loading...</Typography>
    ) : (
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Quiz Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          margin="normal"
        />
        <TextField
          fullWidth
          label="Quiz Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={4}
          required
          margin="normal"
        />
        <FormGroup>
        <FormControlLabel
              control={<Switch checked={timerEnabled} onChange={(e) => setTimerEnabled(e.target.checked)} />}
              label="Enable Timer"
            />
            {timerEnabled && (
              <TextField
                type="number"
                label="Time Limit (minutes)"
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                required
                margin="normal"
                inputProps={{ min: 1 }}
              />
            )}
        </FormGroup>
        <List>
          {questions.map((question, questionIndex) => (
            <ListItem key={questionIndex} alignItems="flex-start">
              <Box width="100%">
                <TextField
                  fullWidth
                  label={`Question ${questionIndex + 1}`}
                  value={question.text}
                  onChange={(e) => updateQuestion(questionIndex, 'text', e.target.value)}
                  required
                  margin="normal"
                />
                <RadioGroup
                  value={question.correctOptionIndex}
                  onChange={(e) => updateQuestion(questionIndex, 'correctOptionIndex', parseInt(e.target.value))}
                >
                  {question.options.map((option, optionIndex) => (
                    <FormControlLabel
                      key={optionIndex}
                      value={optionIndex}
                      control={<Radio />}
                      label={
                        <TextField
                          value={option}
                          onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                          required
                          placeholder={`Option ${optionIndex + 1}`}
                        />
                      }
                    />
                  ))}
                </RadioGroup>
                <IconButton onClick={() => removeQuestion(questionIndex)} edge="end" aria-label="delete">
                  <DeleteIcon />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
        <Button startIcon={<AddIcon />} onClick={addQuestion} variant="outlined" style={{ marginTop: '10px' }}>
          Add Question
        </Button>
        <Box mt={2}>
          <Button type="submit" variant="contained" color="primary">
            Update Quiz
          </Button>
        </Box>
      </form>
    )}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)}>
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Quiz updated successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default EditQuiz;
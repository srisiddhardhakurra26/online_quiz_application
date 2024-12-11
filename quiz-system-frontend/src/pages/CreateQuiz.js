import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createQuiz } from '../api';
import { 
  Container, Typography, TextField, Button, Box, 
  List, IconButton, Radio, RadioGroup, FormControlLabel,
  Snackbar, Switch, FormGroup, Alert, Card, CardContent,
  Stepper, Step, StepLabel, Paper, Tooltip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon,
  Timer as TimerIcon,
  Description as DescriptionIcon,
  QuestionMark as QuestionIcon
} from '@mui/icons-material';

function CreateQuiz() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [creatorId, setCreatorId] = useState('');
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timeLimit, setTimeLimit] = useState(30);
  const navigate = useNavigate();

  const steps = ['Basic Info', 'Questions', 'Review'];
  const [activeStep] = useState(0);
  
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    console.log('Stored userId:', storedUserId);
    if (storedUserId) {
      setCreatorId(storedUserId);
    }
  }, []);

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
    if (!creatorId) {
      setError('You must be logged in to create a quiz.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    if (!validateQuiz()) {
      return;
    }
    try {
      const quizData = { title, description, questions, creatorId, timeLimit: timerEnabled ? timeLimit : null };
      console.log('Quiz data being sent:', quizData);
      await createQuiz(quizData);
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Error creating quiz:', error);
      if (error.response && error.response.status === 403) {
        setError('You are not authorized to create a quiz. Please log in.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError('Failed to create quiz. Please try again.');
      }
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card sx={{ mb: 4, borderRadius: 2, bgcolor: '#f8f9fa' }}>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom sx={{ 
            color: '#1976d2',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            Create New Quiz
          </Typography>
          <Stepper activeStep={activeStep} sx={{ my: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <DescriptionIcon sx={{ mr: 1, color: '#1976d2' }} />
            <Typography variant="h6">Quiz Details</Typography>
          </Box>
          <TextField
            fullWidth
            label="Quiz Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            margin="normal"
            variant="outlined"
            sx={{ mb: 2 }}
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
            variant="outlined"
            sx={{ mb: 2 }}
          />
        </Paper>

        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TimerIcon sx={{ mr: 1, color: '#1976d2' }} />
            <Typography variant="h6">Timer Settings</Typography>
          </Box>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch 
                  checked={timerEnabled} 
                  onChange={(e) => setTimerEnabled(e.target.checked)}
                  color="primary"
                />
              }
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
                sx={{ maxWidth: 200 }}
              />
            )}
          </FormGroup>
        </Paper>

        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <QuestionIcon sx={{ mr: 1, color: '#1976d2' }} />
              <Typography variant="h6">Questions</Typography>
            </Box>
            <Tooltip title="Add a new question">
              <Button
                startIcon={<AddIcon />}
                onClick={addQuestion}
                variant="contained"
                color="primary"
                size="small"
              >
                Add Question
              </Button>
            </Tooltip>
          </Box>

          <List>
            {questions.map((question, questionIndex) => (
              <Paper
                key={questionIndex}
                elevation={1}
                sx={{ 
                  mb: 3, 
                  p: 2, 
                  borderRadius: 2,
                  border: '1px solid #e0e0e0'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    Question {questionIndex + 1}
                  </Typography>
                  <IconButton 
                    onClick={() => removeQuestion(questionIndex)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <TextField
                  fullWidth
                  label="Question Text"
                  value={question.text}
                  onChange={(e) => updateQuestion(questionIndex, 'text', e.target.value)}
                  required
                  margin="normal"
                  variant="outlined"
                />
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: '#666' }}>
                  Answer Options
                </Typography>
                <RadioGroup
                  value={question.correctOptionIndex}
                  onChange={(e) => updateQuestion(questionIndex, 'correctOptionIndex', parseInt(e.target.value))}
                >
                  {question.options.map((option, optionIndex) => (
                    <FormControlLabel
                      key={optionIndex}
                      value={optionIndex}
                      control={<Radio color="primary" />}
                      label={
                        <TextField
                          value={option}
                          onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                          required
                          placeholder={`Option ${optionIndex + 1}`}
                          variant="outlined"
                          size="small"
                          sx={{ ml: 1, flex: 1 }}
                        />
                      }
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        my: 1
                      }}
                    />
                  ))}
                </RadioGroup>
              </Paper>
            ))}
          </List>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            size="large"
            sx={{ 
              minWidth: 200,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem'
            }}
          >
            Create Quiz
          </Button>
        </Box>
      </form>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)}>
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Quiz created successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default CreateQuiz;
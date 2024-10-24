import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { CssBaseline, Container } from '@mui/material';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './components/Login';
import Register from './components/Registration';
import CreateQuiz from './pages/CreateQuiz';
import TakeQuiz from './pages/TakeQuiz';
import QuizResults from './pages/QuizResults';
import LandingPage from './pages/LandingPage';
import EditQuiz from './components/EditQuiz';
import QuizStatsPage from './components/QuizStats';
import UserDashboard from './components/UserDashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <CssBaseline />
      <Container maxWidth="lg">
        <Header isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
        <Routes>
          <Route path="/" element={isAuthenticated ? <Home /> : <LandingPage />} />
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/edit-quiz/:id" element={<EditQuiz />} />
          <Route path="/create-quiz" element={<PrivateRoute><CreateQuiz /></PrivateRoute>} />
          <Route path="/edit-quiz/:id" element={<EditQuiz />} />
          <Route path="/take-quiz/:id" element={<PrivateRoute><TakeQuiz /></PrivateRoute>} />
          <Route path="/quiz-results/:id" element={<PrivateRoute><QuizResults /></PrivateRoute>} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/quiz-stats/:quizId" element={<PrivateRoute><QuizStatsPage /></PrivateRoute>} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
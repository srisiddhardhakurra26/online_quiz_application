import React from 'react';
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
import { AuthProvider } from './context/AuthContext';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

// Separate PrivateRoute component
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Main App component with AuthContext.Consumer for the root element
function App() {
  return (
    <AuthProvider>
      <Router>
        <CssBaseline />
        <Container maxWidth="lg">
          <Header />
          <AuthContext.Consumer>
            {({ isAuthenticated }) => (
              <Routes>
                <Route 
                  path="/" 
                  element={isAuthenticated ? <Home /> : <LandingPage />} 
                />
                <Route 
                  path="/login" 
                  element={<Login />} 
                />
                <Route 
                  path="/register" 
                  element={<Register />} 
                />
                <Route 
                  path="/create-quiz" 
                  element={<PrivateRoute><CreateQuiz /></PrivateRoute>} 
                />
                <Route 
                  path="/edit-quiz/:id" 
                  element={<PrivateRoute><EditQuiz /></PrivateRoute>} 
                />
                <Route 
                  path="/take-quiz/:id" 
                  element={<PrivateRoute><TakeQuiz /></PrivateRoute>} 
                />
                <Route 
                  path="/quiz-results/:id" 
                  element={<PrivateRoute><QuizResults /></PrivateRoute>} 
                />
                <Route 
                  path="/dashboard" 
                  element={<PrivateRoute><UserDashboard /></PrivateRoute>} 
                />
                <Route 
                  path="/quiz-stats/:quizId" 
                  element={<PrivateRoute><QuizStatsPage /></PrivateRoute>} 
                />
              </Routes>
            )}
          </AuthContext.Consumer>
        </Container>
      </Router>
    </AuthProvider>
  );
}

export default App;
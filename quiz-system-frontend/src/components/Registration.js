import React, { useState } from 'react';
import { registerUser } from '../api';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Reusing the same CSS file

const Registration = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (setter) => (e) => {
    setError('');
    setter(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await registerUser({ username, email, password });
      console.log('Registration successful:', response.data);
      alert('Registration successful!');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      setError(
        error.response?.data?.message || 
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Register</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-group">
          <input
            type="text"
            value={username}
            onChange={handleInputChange(setUsername)}
            placeholder="Username"
            disabled={loading}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <input
            type="email"
            value={email}
            onChange={handleInputChange(setEmail)}
            placeholder="Email"
            disabled={loading}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            value={password}
            onChange={handleInputChange(setPassword)}
            placeholder="Password"
            disabled={loading}
            required
            className="form-input"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="login-button"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Registration;
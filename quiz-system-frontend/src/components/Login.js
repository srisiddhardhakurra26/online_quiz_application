import React, { useState } from 'react';
import { loginUser } from '../api';
import { useNavigate } from 'react-router-dom';

const Login = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Sending login request:", { username, password });
    try {
        const response = await loginUser({ username, password });
        console.log("Login response:", response);
        
        const userId = response.data.userId;
        console.log("User ID being stored:", userId);
        
        if (userId) {
            localStorage.setItem('userId', userId);
            setIsAuthenticated(true);
            navigate('/');
        } else {
            console.error("No user ID received from server");
            alert('Login failed. Please try again.');
        }
    } catch (error) {
        console.error('Login failed:', error.response ? error.response.data : error);
        alert('Login failed. Please check your credentials.');
    }
};

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
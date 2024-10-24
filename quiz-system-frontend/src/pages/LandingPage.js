import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';

function LandingPage() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to the Quiz System
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button component={Link} to="/login" variant="contained" color="primary" sx={{ mr: 2 }}>
            Login
          </Button>
          <Button component={Link} to="/register" variant="outlined" color="primary">
            Register
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default LandingPage;
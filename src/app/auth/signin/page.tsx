'use client';

import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the most direct sign-in approach
      // No redirect parameter lets NextAuth handle the redirect automatically
      window.location.href = "/api/auth/signin/google";
    } catch {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
        background: 'linear-gradient(to bottom right, #f3f4f6, #e5e7eb)',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          maxWidth: 500,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Sign In
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph align="center">
          Sign in to CryptoFund to create campaigns, donate to projects, and more
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          sx={{ mt: 2, py: 1.5 }}
        >
          {isLoading ? 'Signing in...' : 'Sign in with Google'}
        </Button>
      </Paper>
    </Box>
  );
} 
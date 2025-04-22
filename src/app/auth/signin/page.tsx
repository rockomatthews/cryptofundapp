'use client';

import React, { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Box, Typography, Button, Paper, Alert, CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignInPage() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams?.get('error') || null
  );

  // If already authenticated, redirect to home
  if (status === 'authenticated') {
    router.push('/');
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);

    try {
      // Use the direct provider URL rather than the default flow
      // This often helps bypass redirect issues
      const result = await signIn('google', { 
        redirect: false,
        callbackUrl: window.location.origin
      });

      if (result?.error) {
        setError(result.error);
        console.error('Sign-in error:', result.error);
      } else if (result?.url) {
        // Manual redirect to help with URL consistency
        window.location.href = result.url;
      }
    } catch (err) {
      console.error('Unexpected sign-in error:', err);
      setError('An unexpected error occurred during sign-in');
    } finally {
      setIsSigningIn(false);
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
            {error === 'OAuthSignin' || error === 'OAuthCallback'
              ? 'There was a problem with Google authentication. Please try again.'
              : error === 'Callback'
              ? 'Authentication callback failed. Check your settings and try again.'
              : error === 'OAuthAccountNotLinked'
              ? 'This email is already associated with a different sign-in method.'
              : error}
          </Alert>
        )}

        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSignIn}
          disabled={isSigningIn || status === 'loading'}
          sx={{ mt: 2, py: 1.5 }}
        >
          {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
        </Button>

        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ mt: 4, width: '100%' }}>
            <Typography variant="caption" component="div" color="text.secondary">
              Debug Info:
            </Typography>
            <pre style={{ fontSize: '0.75rem', overflowX: 'auto' }}>
              {JSON.stringify({ status, error, callbackUrl: window.location.origin }, null, 2)}
            </pre>
          </Box>
        )}
      </Paper>

      <Box sx={{ mt: 4 }}>
        <Button
          variant="text"
          color="primary"
          onClick={() => router.push('/auth/debug')}
        >
          Authentication Debug
        </Button>
      </Box>
    </Box>
  );
} 
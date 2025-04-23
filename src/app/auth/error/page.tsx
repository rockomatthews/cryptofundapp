'use client';

import React, { Suspense } from 'react';
import { Box, Container, Typography, Paper, Button, Alert, AlertTitle, CircularProgress } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// Loading fallback
function ErrorPageLoading() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 8 }}>
      <CircularProgress />
    </Box>
  );
}

// Component that uses useSearchParams
function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const message = searchParams.get('message');

  // Map error codes to user-friendly descriptions
  const getErrorDescription = (errorCode: string | null) => {
    switch (errorCode) {
      case 'OAuthSignin':
        return 'An error occurred while trying to initiate the sign-in process.';
      case 'OAuthCallback':
        return 'An error occurred during the authentication process with the provider.';
      case 'OAuthCreateAccount':
        return 'There was a problem creating your user account.';
      case 'EmailCreateAccount':
        return 'There was a problem creating your user account.';
      case 'Callback':
        return 'There was a problem processing the sign-in request.';
      case 'OAuthAccountNotLinked':
        return 'This email is already associated with an account using a different sign-in method.';
      case 'EmailSignin':
        return 'There was a problem sending the verification email.';
      case 'CredentialsSignin':
        return 'The sign-in credentials were incorrect. Please try again.';
      case 'SessionRequired':
        return 'Please sign in to access this page.';
      default:
        return 'An authentication error occurred. Please try again later.';
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Typography component="h1" variant="h4" color="error" gutterBottom>
        Authentication Error
      </Typography>

      <Alert severity="error" sx={{ width: '100%', mb: 4 }}>
        <AlertTitle>{error || 'Error'}</AlertTitle>
        {message || getErrorDescription(error)}
      </Alert>

      <Typography variant="body1" align="center" sx={{ mt: 2 }}>
        Please try signing in again or contact support if the problem persists.
      </Typography>

      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          href="/auth/signin"
        >
          Back to Sign In
        </Button>
        <Button
          variant="outlined"
          component={Link}
          href="/"
        >
          Go to Home
        </Button>
      </Box>
    </Paper>
  );
}

// Main page component
export default function AuthError() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Container
        component="main"
        maxWidth="sm"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flexGrow: 1,
          py: 8,
        }}
      >
        <Suspense fallback={<ErrorPageLoading />}>
          <ErrorContent />
        </Suspense>
      </Container>
      <Footer />
    </Box>
  );
} 
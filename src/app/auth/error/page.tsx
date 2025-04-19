'use client';

import React, { Suspense } from 'react';
import { Box, Container, Typography, Paper, Button, Alert, CircularProgress } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// Create an ErrorContent component that uses useSearchParams
function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  
  // Map error codes to user-friendly messages
  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'AccessDenied':
        return 'Access denied. You may not have permission to sign in.';
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'Verification':
        return 'The verification link may have expired or already been used.';
      case 'OAuthSignin':
      case 'OAuthCallback':
      case 'OAuthCreateAccount':
      case 'EmailCreateAccount':
      case 'Callback':
      case 'OAuthAccountNotLinked':
      case 'EmailSignin':
      case 'CredentialsSignin':
        return 'There was a problem signing in with the selected provider.';
      default:
        return 'An unknown error occurred during authentication.';
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
      
      <Alert severity="error" sx={{ width: '100%', my: 2 }}>
        {getErrorMessage(error)}
      </Alert>
      
      <Typography variant="body1" sx={{ mb: 4, textAlign: 'center' }}>
        You can try signing in again or contact support if the problem persists.
      </Typography>
      
      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button 
          component={Link} 
          href="/auth/signin" 
          variant="contained" 
          color="primary"
        >
          Try Again
        </Button>
        <Button 
          component={Link} 
          href="/" 
          variant="outlined"
        >
          Back to Home
        </Button>
      </Box>
    </Paper>
  );
}

// Fallback component during suspense
function LoadingFallback() {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        width: '100%', 
        py: 8 
      }}
    >
      <CircularProgress />
    </Box>
  );
}

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
          py: 8
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <ErrorContent />
        </Suspense>
      </Container>
      <Footer />
    </Box>
  );
} 
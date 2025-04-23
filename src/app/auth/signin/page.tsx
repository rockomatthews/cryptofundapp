'use client';

import React, { useState, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Box, Typography, Button, Paper, Alert, CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useRouter, useSearchParams } from 'next/navigation';

// Loading component for Suspense
function SignInLoading() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
      <CircularProgress />
    </Box>
  );
}

// Map of error codes to user-friendly messages
const errorMessages: Record<string, string> = {
  'OAuthSignin': 'Error starting the Google sign-in process. Please try again.',
  'OAuthCallback': 'Error completing the Google sign-in process. Please try again.',
  'OAuthAccountNotLinked': 'This email is already associated with a different sign-in method.',
  'Callback': 'Authentication callback failed. Please try again.',
  'OAuthCreateAccount': 'Could not create a user account. Please try again.',
  'EmailCreateAccount': 'Could not create a user account. Please try again.',
  'Verification': 'The verification link has expired or has already been used.',
  'Default': 'An unexpected error occurred. Please try again.'
};

// Client component that uses useSearchParams
function SignInContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSigningIn, setIsSigningIn] = useState(false);
  
  // Extract error from URL and get user-friendly message
  const errorCode = searchParams?.get('error') || null;
  const [error, setError] = useState<string | null>(
    errorCode ? (errorMessages[errorCode] || errorMessages.Default) : null
  );

  // Get the callbackUrl from the URL or default to home
  const callbackUrl = searchParams?.get('callbackUrl') || '/';
  
  // If already authenticated, redirect to callback URL
  if (status === 'authenticated') {
    router.push(callbackUrl);
    return <SignInLoading />;
  }

  const handleGoogleSignIn = async () => {
    if (isSigningIn) return; // Prevent multiple clicks
    
    setIsSigningIn(true);
    setError(null);

    try {
      // Use the built-in NextAuth flow for more reliable auth
      await signIn('google', { 
        callbackUrl: callbackUrl,
        redirect: true
      });
      
      // The above should redirect, but in case it doesn't:
      setIsSigningIn(false);
    } catch (err) {
      console.error('Unexpected sign-in error:', err);
      setError('An unexpected error occurred. Please try again.');
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
              {JSON.stringify({ 
                status, 
                error: errorCode, 
                callbackUrl
              }, null, 2)}
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

// Main page component with Suspense boundary
export default function SignInPage() {
  return (
    <Suspense fallback={<SignInLoading />}>
      <SignInContent />
    </Suspense>
  );
} 
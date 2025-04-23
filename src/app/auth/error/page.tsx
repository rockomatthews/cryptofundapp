'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { Box, Typography, Paper, Button, Alert, List, ListItem, ListItemIcon, ListItemText, CircularProgress } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import ErrorIcon from '@mui/icons-material/Error';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';

// Loading fallback for Suspense
function AuthErrorLoading() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );
}

// Error messages with detailed descriptions
const errorMessages: Record<string, { title: string, description: string }> = {
  'AccessDenied': {
    title: 'Access Denied',
    description: 'You do not have permission to access this resource.'
  },
  'Configuration': {
    title: 'Server Configuration Error',
    description: 'There is a problem with the server configuration. Our team has been notified.'
  },
  'Verification': {
    title: 'Invalid Verification',
    description: 'The verification link is invalid or has expired. Please request a new one.'
  },
  'OAuthSignin': {
    title: 'Google Sign-In Error',
    description: 'Error initiating the Google sign-in process. This might be due to browser cookies, cache, or network issues.'
  },
  'OAuthCallback': {
    title: 'Google Callback Error',
    description: 'Error during the Google authentication callback. This might be due to network interruption or misconfigured OAuth settings.'
  },
  'EmailCreateAccount': {
    title: 'Account Creation Failed',
    description: 'Error creating an account with your email. Please try another method.'
  },
  'Callback': {
    title: 'Authentication Callback Failed',
    description: 'Error during the authentication process. This might be due to network issues or server misconfiguration.'
  },
  'OAuthAccountNotLinked': {
    title: 'Account Already Exists',
    description: 'This email is already associated with another account. Please sign in using your original provider.'
  },
  'Default': {
    title: 'Authentication Error',
    description: 'An unknown authentication error occurred. Please try again or contact support.'
  }
};

// Client component that uses useSearchParams
function ErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [errorCode, setErrorCode] = useState<string>('Default');
  
  useEffect(() => {
    // Get error from URL query parameter
    const errorParam = searchParams.get('error');
    setErrorCode(errorParam || 'Default');
  }, [searchParams]);
  
  // Get the specific error details
  const errorDetails = errorMessages[errorCode] || errorMessages.Default;
  
  // Determine if this is a Google-specific error
  const isGoogleError = errorCode === 'OAuthSignin' || errorCode === 'OAuthCallback';
  
  return (
    <Box sx={{ margin: '2rem auto', maxWidth: '800px', padding: '2rem' }}>
      <Paper elevation={3} sx={{ padding: '2rem', borderRadius: '8px' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'error.main', display: 'flex', alignItems: 'center' }}>
          <ErrorIcon sx={{ mr: 1 }} /> {errorDetails.title}
        </Typography>
        
        <Alert severity="error" sx={{ my: 2 }}>
          {errorDetails.description}
        </Alert>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Recommended Steps:
        </Typography>
        
        <List>
          {isGoogleError && (
            <>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Check your Google account" 
                  secondary="Ensure you have a valid Google account and that third-party cookies are enabled."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Try incognito mode" 
                  secondary="Use a private/incognito browser window to rule out browser extension conflicts."
                />
              </ListItem>
            </>
          )}
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Clear browser data" 
              secondary="Clear your browser cookies, cache, and site data for this website."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Check your internet connection" 
              secondary="Ensure you have a stable internet connection before trying again."
            />
          </ListItem>
          {errorCode === 'OAuthAccountNotLinked' && (
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Use your original provider" 
                secondary="Sign in with the method you originally used to create your account."
              />
            </ListItem>
          )}
        </List>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />} 
            onClick={() => router.push('/')}
          >
            Return to Home
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => router.push('/auth/signin')}
          >
            Try Again
          </Button>
        </Box>
        
        {/* Display error code in development or when verbose error reporting is enabled */}
        {(process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_VERBOSE_ERRORS === 'true') && (
          <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #eee' }}>
            <Typography variant="caption" color="text.secondary">
              Error Code: {errorCode}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

// Page component
export default function AuthErrorPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<AuthErrorLoading />}>
        <ErrorContent />
      </Suspense>
      <Footer />
    </>
  );
} 
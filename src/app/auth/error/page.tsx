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

// Client component that uses useSearchParams
function ErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Get error from URL query parameter
    const errorParam = searchParams.get('error');
    setError(errorParam);
  }, [searchParams]);
  
  return (
    <Box sx={{ margin: '2rem auto', maxWidth: '800px', padding: '2rem' }}>
      <Paper elevation={3} sx={{ padding: '2rem', borderRadius: '8px' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'error.main', display: 'flex', alignItems: 'center' }}>
          <ErrorIcon sx={{ mr: 1 }} /> Authentication Error
        </Typography>
        
        <Alert severity="error" sx={{ my: 2 }}>
          {error === 'AccessDenied' && 'Access denied. You do not have permission to access this resource.'}
          {error === 'Configuration' && 'There is a problem with the server configuration. Please try again later.'}
          {error === 'Verification' && 'The verification link is invalid or has expired. Please request a new one.'}
          {error === 'OAuthSignin' && 'Error in the OAuth sign-in process. Please try again.'}
          {error === 'OAuthCallback' && 'Error in the OAuth callback process. Please try again.'}
          {error === 'EmailCreateAccount' && 'Error creating an account with your email. Please try another method.'}
          {error === 'Callback' && 'Error during the authentication callback. Please try again.'}
          {error === 'OAuthAccountNotLinked' && 'This email is already associated with another account. Please sign in using your original provider.'}
          {error === 'Default' || !error ? 'An unknown authentication error occurred.' : null}
        </Alert>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Troubleshooting Steps:
        </Typography>
        
        <List>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Verify that you are using the correct account for sign-in" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Check your internet connection and try again" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Clear your browser cookies and cache" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Try using a different authentication method" />
          </ListItem>
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
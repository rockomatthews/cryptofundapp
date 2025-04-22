'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, Alert, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import ErrorIcon from '@mui/icons-material/Error';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams?.get('error');
    setError(errorParam);
  }, [searchParams]);

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'You do not have permission to sign in.';
      case 'Verification':
        return 'The verification link may have expired or been used already.';
      case 'OAuthSignin':
        return 'Error in the OAuth signin process. Please try again.';
      case 'OAuthCallback':
        return 'Error in the OAuth callback process. This may be due to an invalid callback URL.';
      case 'OAuthCreateAccount':
        return 'Could not create an OAuth account.';
      case 'EmailCreateAccount':
        return 'Could not create an email account.';
      case 'Callback':
        return 'Error in the authentication callback.';
      case 'OAuthAccountNotLinked':
        return 'This email is already associated with another account. Please sign in using the original method.';
      case 'EmailSignin':
        return 'Error sending the email signin link.';
      case 'CredentialsSignin':
        return 'Sign in failed. Check the details you provided are correct.';
      case 'SessionRequired':
        return 'Please sign in to access this page.';
      default:
        return 'An unknown error occurred. Please try again.';
    }
  };

  const getTroubleshootingSteps = (errorCode: string | null) => {
    const commonSteps = [
      'Check that cookies are enabled in your browser',
      'Try using a different browser or incognito mode',
      'Clear your browser cookies and cache',
    ];

    const specificSteps = {
      'Configuration': [
        'Contact the site administrator',
        'Check that all environment variables are properly set'
      ],
      'OAuthSignin': [
        'Wait a few minutes and try again',
        'Check if you have disabled third-party cookies',
        'Try a different Google account'
      ],
      'OAuthCallback': [
        'Make sure you are using HTTPS in production',
        'Check that the callback URL matches your OAuth provider settings'
      ],
      'OAuthAccountNotLinked': [
        'Sign in using the method you originally used'
      ]
    };

    // Combine common steps with error-specific steps
    const steps = [
      ...(specificSteps[errorCode as keyof typeof specificSteps] || []),
      ...commonSteps
    ];

    return steps;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2,
          background: 'linear-gradient(to bottom right, #f3f4f6, #e5e7eb)',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            width: '100%',
            maxWidth: 600,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
          
          <Typography variant="h4" component="h1" gutterBottom>
            Authentication Error
          </Typography>

          <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
            {getErrorMessage(error)}
          </Alert>

          <Typography variant="h6" sx={{ alignSelf: 'flex-start', mt: 2, mb: 1 }}>
            Troubleshooting Steps:
          </Typography>
          
          <List sx={{ width: '100%', mb: 3 }}>
            {getTroubleshootingSteps(error).map((step, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary={step} />
              </ListItem>
            ))}
          </List>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/auth/signin')}
            >
              Back to Sign In
            </Button>
            
            <Button
              variant="contained"
              component={Link}
              href="/auth/debug"
            >
              Authentication Debug
            </Button>
          </Box>
        </Paper>
      </Box>
      <Footer />
    </Box>
  );
} 
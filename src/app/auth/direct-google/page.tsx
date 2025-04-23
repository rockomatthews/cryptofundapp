'use client';

import React from 'react';
import { Box, Container, Typography, Button, Paper, Alert, Divider } from '@mui/material';

export default function DirectGoogleAuth() {
  // Get the current URL for debugging
  const [currentUrl, setCurrentUrl] = React.useState<string>('');
  
  React.useEffect(() => {
    setCurrentUrl(window.location.origin);
  }, []);
  
  // Handle direct auth click
  const handleDirectAuth = () => {
    try {
      console.log('Starting direct Google auth...');
      const googleUrl = `/api/auth/signin/google?callbackUrl=${encodeURIComponent('/')}`;
      console.log('Redirecting to:', googleUrl);
      window.location.href = googleUrl;
    } catch (error) {
      console.error('Error redirecting:', error);
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Direct Google Auth Test
        </Typography>
        
        <Alert severity="info" sx={{ my: 2 }}>
          This page provides direct links to test Google authentication, bypassing the normal sign-in flow.
        </Alert>
        
        <Box sx={{ my: 3 }}>
          <Typography variant="h6" gutterBottom>
            Current site URL:
          </Typography>
          <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
            {currentUrl}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Test Methods:
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 3 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleDirectAuth}
            fullWidth
          >
            Direct Google Sign In (Client Navigation)
          </Button>
          
          <Button 
            variant="outlined" 
            color="primary"
            href="/api/auth/signin/google?callbackUrl=%2F"
            fullWidth
          >
            Direct Google Sign In (Link)
          </Button>
          
          <Button 
            variant="outlined" 
            color="secondary"
            href="/api/auth/providers"
            fullWidth
          >
            Check Available Providers
          </Button>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Debug Links:
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 3 }}>
          <Button 
            variant="outlined" 
            href="/api/auth/debug-oauth"
            fullWidth
          >
            Check OAuth Configuration
          </Button>
          
          <Button 
            variant="outlined" 
            href="/api/auth/session"
            fullWidth
          >
            Check Current Session
          </Button>
          
          <Button 
            variant="outlined" 
            href="/auth/check-api"
            fullWidth
          >
            Go to API Check Page
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 
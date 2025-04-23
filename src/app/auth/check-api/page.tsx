'use client';

import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, CircularProgress, Alert, Paper } from '@mui/material';

type AuthResponse = {
  expires?: string;
  user?: Record<string, unknown> | null;
} | null;

export default function CheckAuthAPI() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuthResponse>(null);
  const [error, setError] = useState<string | null>(null);

  const testAuthAPIEndpoint = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Make a request to the API endpoint directly
      const response = await fetch('/api/auth/session');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch from API: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Auth session API response:', data);
      setResult(data);
      
    } catch (error) {
      console.error('Error testing auth API:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    testAuthAPIEndpoint();
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Auth API Test
        </Typography>
        
        <Typography paragraph>
          This page tests if your authentication API endpoints are working properly. If they are, 
          but sign-in isn&apos;t working, there&apos;s likely an issue with the OAuth configuration or callback handling.
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            Error: {error}
          </Alert>
        ) : (
          <>
            <Alert severity={result?.expires ? "success" : "warning"} sx={{ mb: 3 }}>
              {result?.expires ? "Auth API is working properly" : "Auth API returned empty response"}
            </Alert>
            
            <Typography variant="h6" gutterBottom>
              API Response:
            </Typography>
            
            <Box 
              component="pre" 
              sx={{ 
                p: 2, 
                bgcolor: 'background.paper', 
                border: '1px solid', 
                borderColor: 'divider',
                borderRadius: 1,
                overflowX: 'auto',
                fontSize: '0.875rem'
              }}
            >
              {JSON.stringify(result, null, 2)}
            </Box>
          </>
        )}
        
        <Box sx={{ mt: 3 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={testAuthAPIEndpoint}
            disabled={loading}
          >
            {loading ? "Testing..." : "Test Auth API Again"}
          </Button>
          
          <Button 
            variant="outlined" 
            color="primary" 
            href="/auth/signin"
            sx={{ ml: 2 }}
          >
            Go to Sign In
          </Button>
          
          <Button 
            variant="outlined" 
            color="secondary" 
            href="/api/auth/signin/google?callbackUrl=%2F"
            sx={{ ml: 2 }}
          >
            Direct Google Auth
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 
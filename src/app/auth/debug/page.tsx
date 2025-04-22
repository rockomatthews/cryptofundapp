'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Box, Typography, Paper, Button, Alert, CircularProgress } from '@mui/material';
import Link from 'next/link';

export default function AuthDebugPage() {
  const { data: session, status } = useSession();
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [serverEnvVars, setServerEnvVars] = useState<Record<string, string | boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Get client-side public environment variables
    const publicEnvVars = {
      NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL || 'not set',
      NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV || 'not set',
      NODE_ENV: process.env.NODE_ENV || 'not set',
      // Add any other public env vars here
    };
    setEnvVars(publicEnvVars);
    
    // Fetch server-side environment variables through API
    fetchServerEnvInfo();
  }, []);
  
  const fetchServerEnvInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/debug');
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setServerEnvVars(data.env || {});
    } catch (err) {
      console.error('Error fetching server environment info:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Auth Debugging
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Session Status: <strong>{status}</strong>
        </Typography>
        
        {status === 'loading' ? (
          <CircularProgress size={24} />
        ) : status === 'authenticated' ? (
          <Alert severity="success">Authenticated as {session?.user?.email}</Alert>
        ) : (
          <Alert severity="warning">Not authenticated</Alert>
        )}
        
        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Session Data:
        </Typography>
        <Box component="pre" sx={{ 
          p: 2, 
          backgroundColor: 'rgba(0,0,0,0.04)', 
          borderRadius: 1,
          overflow: 'auto',
          fontSize: '0.875rem'
        }}>
          {JSON.stringify(session, null, 2)}
        </Box>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Client Environment Variables (Public Only)
        </Typography>
        <Box component="pre" sx={{ 
          p: 2, 
          backgroundColor: 'rgba(0,0,0,0.04)', 
          borderRadius: 1,
          overflow: 'auto',
          fontSize: '0.875rem'
        }}>
          {JSON.stringify(envVars, null, 2)}
        </Box>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Server Environment & Auth Configuration
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Box component="pre" sx={{ 
            p: 2, 
            backgroundColor: 'rgba(0,0,0,0.04)', 
            borderRadius: 1,
            overflow: 'auto',
            fontSize: '0.875rem'
          }}>
            {JSON.stringify(serverEnvVars, null, 2)}
          </Box>
        )}
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button 
          variant="outlined" 
          component={Link} 
          href="/auth/signin"
        >
          Go to Sign In
        </Button>
        <Button 
          variant="contained" 
          onClick={() => fetchServerEnvInfo()}
          disabled={loading}
        >
          Refresh Data
        </Button>
      </Box>
    </Box>
  );
} 
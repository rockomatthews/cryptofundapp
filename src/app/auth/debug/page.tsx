'use client';

import React, { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Box, Typography, Paper, Button, Alert, CircularProgress, Divider, Chip } from '@mui/material';
import Link from 'next/link';

export default function AuthDebugPage() {
  const { data: session, status } = useSession();
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [serverEnvVars, setServerEnvVars] = useState<Record<string, string | boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cookiesEnabled, setCookiesEnabled] = useState<boolean | null>(null);
  const [thirdPartyCookiesEnabled, setThirdPartyCookiesEnabled] = useState<boolean | null>(null);
  const [localStorageAvailable, setLocalStorageAvailable] = useState<boolean | null>(null);
  
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
    
    // Check browser capabilities
    checkBrowserCapabilities();
  }, []);
  
  const checkBrowserCapabilities = () => {
    // Check if cookies are enabled
    setCookiesEnabled(navigator.cookieEnabled);
    
    // Check localStorage
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      setLocalStorageAvailable(true);
    } catch (e) {
      setLocalStorageAvailable(false);
    }
    
    // Check third-party cookies
    // This is a best-effort approach, not 100% reliable
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = 'https://www.google.com/recaptcha/api2/anchor?ar=1&k=test';
    
    document.body.appendChild(iframe);
    setTimeout(() => {
      // If we can access iframe cookies, third-party cookies might be enabled
      try {
        const hasAccess = iframe.contentWindow && iframe.contentWindow.document;
        setThirdPartyCookiesEnabled(!!hasAccess);
      } catch (e) {
        setThirdPartyCookiesEnabled(false);
      }
      document.body.removeChild(iframe);
    }, 1000);
  };
  
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

  // Test direct OAuth flow
  const testGoogleAuth = async () => {
    try {
      // Use a direct provider URL to test OAuth flow
      const result = await signIn('google', { redirect: false });
      console.log('Google auth test result:', result);
      
      if (result?.error) {
        setError(`OAuth test failed: ${result.error}`);
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('OAuth test error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error during OAuth test');
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
          Browser Capabilities
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Chip 
            label={`Cookies: ${cookiesEnabled ? 'Enabled' : 'Disabled'}`} 
            color={cookiesEnabled ? 'success' : 'error'} 
            variant="outlined" 
          />
          <Chip 
            label={`Third-Party Cookies: ${thirdPartyCookiesEnabled === null ? 'Checking...' : thirdPartyCookiesEnabled ? 'Enabled' : 'Disabled'}`} 
            color={thirdPartyCookiesEnabled ? 'success' : 'error'} 
            variant="outlined" 
          />
          <Chip 
            label={`LocalStorage: ${localStorageAvailable ? 'Available' : 'Unavailable'}`} 
            color={localStorageAvailable ? 'success' : 'error'} 
            variant="outlined" 
          />
          <Chip 
            label={`Secure Context: ${window.isSecureContext ? 'Yes' : 'No'}`} 
            color={window.isSecureContext ? 'success' : 'error'} 
            variant="outlined" 
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          These capabilities are important for authentication to work properly. Cookies must be enabled, and some providers require third-party cookies.
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={testGoogleAuth}
          sx={{ mt: 1 }}
        >
          Test Google OAuth Connection
        </Button>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
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
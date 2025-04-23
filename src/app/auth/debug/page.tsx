'use client';

import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Alert, CircularProgress, List, ListItem, ListItemText, Divider, Button } from '@mui/material';
import { useSession } from 'next-auth/react';

// Define type for server info response
interface ServerInfo {
  authConfig: {
    providersConfigured: {
      google: boolean;
    };
    nextAuthUrlConfigured: boolean;
    secretConfigured: boolean;
  };
  sessionStatus: {
    hasSession: boolean;
    authenticated: boolean;
  };
  serverEnv: {
    nodeEnv: string;
    vercelEnv: string;
  };
}

export default function AuthDebug() {
  const { data: session, status } = useSession();
  const [envChecks, setEnvChecks] = useState({
    nextAuthUrl: 'Checking...',
    googleProviders: 'Checking...',
    secretSet: 'Checking...'
  });
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check environment variables from window
    const checkEnv = async () => {
      const checks = {
        nextAuthUrl: process.env.NEXT_PUBLIC_NEXTAUTH_URL ? 'Set' : 'Not set',
        googleProviders: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
        secretSet: process.env.NEXT_PUBLIC_NEXTAUTH_SECRET ? 'Set' : 'Not set (should be server-side only)'
      };
      
      setEnvChecks(checks);
    };
    
    checkEnv();
    fetchServerInfo();
  }, []);
  
  const fetchServerInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/auth/debug');
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      setServerInfo(data);
    } catch (err) {
      console.error('Error fetching server info:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Auth Debug Page
        </Typography>
        
        <Typography variant="body1" paragraph>
          This page helps diagnose authentication issues.
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>
          Session Status: {status}
        </Typography>
        
        {status === 'loading' ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : status === 'authenticated' ? (
          <Alert severity="success" sx={{ mb: 3 }}>
            Authenticated successfully
          </Alert>
        ) : (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Not authenticated
          </Alert>
        )}
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>
          Client Environment Checks:
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText 
              primary="NEXTAUTH_URL" 
              secondary={envChecks.nextAuthUrl} 
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Google Provider" 
              secondary={envChecks.googleProviders} 
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="NEXTAUTH_SECRET" 
              secondary={envChecks.secretSet} 
            />
          </ListItem>
        </List>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>
          Server Environment:
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error fetching server info: {error}
          </Alert>
        ) : serverInfo ? (
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
            {JSON.stringify(serverInfo, null, 2)}
          </Box>
        ) : (
          <Alert severity="info">No server information available</Alert>
        )}
        
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={fetchServerInfo} 
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? 'Checking...' : 'Check Server Config'}
        </Button>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>
          Session Data:
        </Typography>
        
        <Box 
          component="pre" 
          sx={{ 
            p: 2, 
            bgcolor: 'background.paper', 
            border: '1px solid', 
            borderColor: 'divider',
            borderRadius: 1,
            overflowX: 'auto'
          }}
        >
          {JSON.stringify(session, null, 2)}
        </Box>
      </Paper>
    </Container>
  );
} 
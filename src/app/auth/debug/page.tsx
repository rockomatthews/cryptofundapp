'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Box, Typography, Paper, Button, Alert } from '@mui/material';
import Link from 'next/link';

export default function AuthDebugPage() {
  const { data: session, status } = useSession();
  const [envVars, setEnvVars] = useState<Record<string, string>>({});

  useEffect(() => {
    // Get relevant public environment variables
    const publicEnvVars = {
      NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL || 'not set',
      NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV || 'not set',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'not set (private)',
    };
    setEnvVars(publicEnvVars);
  }, []);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Auth Debugging
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Session Status: <strong>{status}</strong>
        </Typography>

        {status === 'loading' ? (
          <Alert severity="info">Loading session...</Alert>
        ) : status === 'authenticated' ? (
          <Alert severity="success">
            Authenticated as {session?.user?.email || 'unknown'}
          </Alert>
        ) : (
          <Alert severity="warning">Not authenticated</Alert>
        )}

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Session Data:
          </Typography>
          <pre
            style={{
              background: '#f5f5f5',
              padding: '1rem',
              borderRadius: '4px',
              overflowX: 'auto',
            }}
          >
            {JSON.stringify(session, null, 2)}
          </pre>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Environment Variables:
          </Typography>
          <pre
            style={{
              background: '#f5f5f5',
              padding: '1rem',
              borderRadius: '4px',
              overflowX: 'auto',
            }}
          >
            {JSON.stringify(envVars, null, 2)}
          </pre>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            href="/auth/signin"
          >
            Go to Sign In
          </Button>
          <Button
            variant="outlined"
            color="primary"
            component={Link}
            href="/"
          >
            Go to Home
          </Button>
        </Box>
      </Paper>
    </Box>
  );
} 
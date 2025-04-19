'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Box, Container, CircularProgress, Typography } from '@mui/material';

export default function SignOut() {
  const router = useRouter();
  
  useEffect(() => {
    // Sign out and redirect to home page
    const performSignOut = async () => {
      await signOut({ redirect: false });
      router.push('/');
    };
    
    performSignOut();
  }, [router]);
  
  return (
    <Container 
      sx={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center' 
      }}
    >
      <CircularProgress size={60} />
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">
          Signing out...
        </Typography>
      </Box>
    </Container>
  );
} 
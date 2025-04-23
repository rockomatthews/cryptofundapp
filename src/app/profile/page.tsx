'use client';

import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button,
} from '@mui/material';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';

export default function ProfilePage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          py: 6,
          bgcolor: 'background.default',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Container maxWidth="md">
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Authentication Disabled
            </Typography>
            
            <Typography variant="body1" paragraph>
              Profile functionality is currently unavailable as authentication has been temporarily disabled.
            </Typography>
            
            <Button
              variant="contained"
              color="primary"
              component={Link}
              href="/"
              sx={{ mt: 2 }}
            >
              Return to Home
            </Button>
          </Paper>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
} 
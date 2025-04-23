'use client';

import React from 'react';
import { Box, Container, Typography, Paper, Button, Divider } from '@mui/material';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getProviders } from 'next-auth/react';
import SignInButton from '@/app/components/SignInButton';
import { ClientSafeProvider } from 'next-auth/react';

type Providers = Record<string, ClientSafeProvider>;

export default function SignIn() {
  const { data: session } = useSession();
  const router = useRouter();
  const [providers, setProviders] = React.useState<Providers | null>(null);
  
  // Redirect to home if already signed in
  React.useEffect(() => {
    if (session) {
      router.push('/');
    }
  }, [session, router]);
  
  // Get auth providers
  React.useEffect(() => {
    const fetchProviders = async () => {
      const providers = await getProviders();
      setProviders(providers);
    };
    
    fetchProviders();
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Container 
        component="main" 
        maxWidth="sm" 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flexGrow: 1,
          py: 8
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h4" color="primary" gutterBottom>
            Sign in to your account
          </Typography>
          
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Welcome back to CryptoFund
          </Typography>
          
          <Box sx={{ width: '100%', mt: 2 }}>
            {providers && Object.values(providers).map((provider) => (
              <SignInButton 
                key={provider.id} 
                provider={provider} 
                sx={{ mb: 2, width: '100%' }}
              />
            ))}
          </Box>
          
          <Divider sx={{ width: '100%', my: 3 }} />
          
          <Typography variant="body2" color="text.secondary">
            By signing in, you agree to our{' '}
            <Link href="/terms" style={{ color: 'inherit', fontWeight: 'bold' }}>
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" style={{ color: 'inherit', fontWeight: 'bold' }}>
              Privacy Policy
            </Link>
          </Typography>
        </Paper>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Don&apos;t have an account yet?{' '}
            <Button
              component={Link}
              href="/auth/signup"
              color="primary"
              variant="text"
              size="small"
              sx={{ fontWeight: 'bold' }}
            >
              Sign up
            </Button>
          </Typography>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
} 
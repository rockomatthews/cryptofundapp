'use client';

import React from 'react';
import { Box, Container, Typography, Paper, Button, Divider, CircularProgress, Alert } from '@mui/material';
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
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  
  // Redirect to home if already signed in
  React.useEffect(() => {
    if (session) {
      router.push('/');
    }
  }, [session, router]);
  
  // Get auth providers
  React.useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        const fetchedProviders = await getProviders();
        console.log("Fetched auth providers:", fetchedProviders);
        setProviders(fetchedProviders);
        setError(null);
      } catch (err) {
        console.error("Error fetching auth providers:", err);
        setError("Failed to load sign-in options. Please try again later.");
      } finally {
        setLoading(false);
      }
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
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            ) : providers && Object.keys(providers).length > 0 ? (
              Object.values(providers).map((provider) => (
                <SignInButton 
                  key={provider.id} 
                  provider={provider} 
                  sx={{ mb: 2, width: '100%' }}
                />
              ))
            ) : (
              <Alert severity="warning" sx={{ mb: 3 }}>
                No sign-in providers available. Please check your configuration.
              </Alert>
            )}
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
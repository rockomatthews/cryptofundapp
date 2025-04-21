'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Avatar, 
  Button, 
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { Grid } from '@/app/components/GridFix';

// Supported cryptocurrencies for wallet addresses
const SUPPORTED_CURRENCIES = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'USDT', name: 'Tether' },
  { symbol: 'USDC', name: 'USD Coin' },
  { symbol: 'DOT', name: 'Polkadot' },
  { symbol: 'ADA', name: 'Cardano' }
];

export default function ProfileEdit() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  
  // Profile state
  const [username, setUsername] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  
  // Wallet management
  const [walletAddresses, setWalletAddresses] = useState<Record<string, string>>({});
  const [newWalletType, setNewWalletType] = useState<string>('');
  const [newWalletAddress, setNewWalletAddress] = useState<string>('');
  
  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);
  
  // Load user data
  useEffect(() => {
    if (session?.user && !initialDataLoaded) {
      // Initialize with session data as temporary values
      setUsername(session.user.name || '');
      setProfilePicture(session.user.image || null);
      
      // Fetch complete profile data from API
      const fetchUserData = async () => {
        try {
          console.log('Fetching profile data from API...');
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const userData = await response.json();
            console.log('User data loaded from API:', userData);
            
            // Replace with API data - use empty values as fallbacks
            setUsername(userData.name || '');
            setBio(userData.bio || '');
            setProfilePicture(userData.image || null);
            setWalletAddresses(userData.walletAddresses || {});
          } else {
            console.warn('API responded with error, using session data');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // We're already using session data as initial values
        } finally {
          setInitialDataLoaded(true);
        }
      };
      
      fetchUserData();
    }
  }, [session, initialDataLoaded]);
  
  // Handle profile picture upload click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle profile picture change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePictureFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Add wallet address
  const handleAddWallet = () => {
    if (!newWalletType || !newWalletAddress.trim()) {
      setError('Please select a currency and enter a wallet address');
      return;
    }
    
    // Basic wallet address validation
    if (!validateWalletAddress(newWalletType, newWalletAddress)) {
      setError(`Invalid ${newWalletType} wallet address format`);
      return;
    }
    
    // Update wallet addresses
    setWalletAddresses(prev => ({
      ...prev,
      [newWalletType]: newWalletAddress.trim()
    }));
    
    // Reset form
    setNewWalletType('');
    setNewWalletAddress('');
    setError(null);
  };
  
  // Remove wallet address
  const handleRemoveWallet = (currency: string) => {
    setWalletAddresses(prev => {
      const updated = { ...prev };
      delete updated[currency];
      return updated;
    });
  };
  
  // Basic wallet address validation
  const validateWalletAddress = (currency: string, address: string): boolean => {
    // Very basic validation - in a real app, you'd want more thorough validation
    switch (currency) {
      case 'BTC':
        return address.length >= 26 && address.length <= 35;
      case 'ETH':
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      case 'SOL':
        return address.length >= 32 && address.length <= 44;
      default:
        return address.length > 10; // Basic fallback validation
    }
  };
  
  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Prepare data to send - always include all fields to prevent data loss
      const dataToSend = {
        username,
        bio,
        walletAddresses,
        // Always include the profile picture to prevent it from being lost
        profilePicture: profilePicture
      };
      
      console.log('Sending data to update API:', JSON.stringify({
        username: dataToSend.username,
        bioLength: (dataToSend.bio || '').length,
        profilePictureIncluded: !!dataToSend.profilePicture,
        walletAddressesCount: Object.keys(dataToSend.walletAddresses || {}).length
      }));
      
      // Save the user data to our API endpoint
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();
      console.log('Update response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }
      
      setSuccess('Profile updated successfully!');
      
      // Update session data with new values
      if (session && session.user) {
        session.user.name = username;
        if (profilePictureFile) {
          session.user.image = profilePicture;
        }
      }
      
      // Redirect back to profile page after a delay
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } catch (error) {
      setError(`Error updating profile: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };
  
  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Get available currencies (currencies that don't have a wallet address yet)
  const availableCurrencies = SUPPORTED_CURRENCIES.filter(
    currency => !walletAddresses[currency.symbol]
  );
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      
      <Container component="main" maxWidth="md" sx={{ flexGrow: 1, py: 6 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography component="h1" variant="h4" gutterBottom>
            Edit Your Profile
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Profile Picture */}
              <Grid item xs={12} display="flex" justifyContent="center">
                <Box
                  sx={{
                    position: 'relative',
                    width: 150,
                    height: 150,
                  }}
                >
                  <Avatar
                    src={profilePicture || undefined}
                    sx={{
                      width: 150,
                      height: 150,
                      border: '2px solid',
                      borderColor: 'divider',
                    }}
                  />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: 'background.paper',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                    onClick={handleUploadClick}
                  >
                    <PhotoCameraIcon />
                  </IconButton>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Box>
              </Grid>
              
              {/* Username */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Grid>
              
              {/* Bio */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  placeholder="Tell others about yourself..."
                  multiline
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  helperText="Share a bit about yourself, your interests, or what kind of projects you support"
                />
              </Grid>
              
              {/* Wallet Addresses */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Wallet Addresses
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Add your wallet addresses to easily receive donations and manage campaign funds
                </Typography>
                
                {/* List of existing wallet addresses */}
                <List>
                  {Object.entries(walletAddresses).map(([currency, address]) => (
                    <ListItem key={currency}>
                      <ListItemText 
                        primary={`${currency} Wallet`}
                        secondary={address}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => handleRemoveWallet(currency)}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
                
                {/* Add new wallet address */}
                {availableCurrencies.length > 0 && (
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel id="wallet-currency-label">Currency</InputLabel>
                      <Select
                        labelId="wallet-currency-label"
                        value={newWalletType}
                        onChange={(e) => setNewWalletType(e.target.value)}
                        label="Currency"
                      >
                        <MenuItem value="" disabled>Select</MenuItem>
                        {availableCurrencies.map(currency => (
                          <MenuItem key={currency.symbol} value={currency.symbol}>
                            {currency.symbol} ({currency.name})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <TextField
                      fullWidth
                      label="Wallet Address"
                      placeholder="Enter your wallet address"
                      value={newWalletAddress}
                      onChange={(e) => setNewWalletAddress(e.target.value)}
                    />
                    
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleAddWallet}
                      disabled={!newWalletType || !newWalletAddress.trim()}
                    >
                      Add
                    </Button>
                  </Box>
                )}
              </Grid>
              
              {/* Submit Button */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  fullWidth
                >
                  {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
      
      <Footer />
    </Box>
  );
} 
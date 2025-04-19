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
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { Grid } from '@/app/components/GridFix';

export default function ProfileEdit() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile state
  const [username, setUsername] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  
  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);
  
  // Load user data
  useEffect(() => {
    if (session?.user) {
      setUsername(session.user.name || '');
      setProfilePicture(session.user.image || null);
      
      // Fetch user's bio if we had one in the database
      // In a real app, this would come from a database query
      const fetchUserData = async () => {
        try {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const userData = await response.json();
            setBio(userData.bio || '');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      };
      
      fetchUserData();
    }
  }, [session]);
  
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
  
  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Upload profile picture if changed
      let imageUrl = session?.user?.image || null;
      
      if (profilePictureFile) {
        // In a real application, you would upload the file to a storage service
        // For demo purposes, we'll pretend it's uploaded
        imageUrl = URL.createObjectURL(profilePictureFile);
      }
      
      // Save the user data to our API endpoint
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          bio,
          profilePicture: imageUrl
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }
      
      setSuccess('Profile updated successfully!');
      
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
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Avatar, 
  Divider, 
  Tabs, 
  Tab, 
  Card, 
  CardMedia, 
  CardContent, 
  CardActionArea,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Button,
  CircularProgress
} from '@mui/material';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';
import { getMockUser, getUserCampaigns } from '../lib/userService';
import { useSession } from 'next-auth/react';
import EditIcon from '@mui/icons-material/Edit';
import { useRouter } from 'next/navigation';

// Define Campaign and Donation types to replace 'any'
interface Campaign {
  id: string;
  title: string;
  description: string;
  image?: string;
  goalAmount: number;
  currency: string;
  backers?: number;
  category?: string;
}

interface Donation {
  id: string;
  amount: number;
  currency: string;
  campaignId: string;
  campaignTitle?: string;
  timestamp?: string | Date;
  message?: string;
  usdAmount?: number;
}

// TabPanel component for tab content
function TabPanel(props: {
  children?: React.ReactNode;
  index: number;
  value: number;
}) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const [tabValue, setTabValue] = useState(0);
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    bio?: string;
    walletAddresses: Record<string, string>;
    totalDonated: number;
    campaigns: Campaign[];
    donations: Donation[];
    createdAt?: Date;
  } | null>(null);
  const [userCampaigns, setUserCampaigns] = useState<Campaign[]>([]);
  const router = useRouter();

  // Check authentication and redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Load user data from API
  useEffect(() => {
    if (session?.user) {
      const fetchUserData = async () => {
        try {
          setLoading(true);
          const response = await fetch('/api/user/profile');
          
          // Process data even if status code is not 200
          const userData = await response.json();
          
          if (!response.ok && userData.error && !userData.fallback) {
            throw new Error(userData.error || 'Failed to fetch profile data');
          }
          
          // If we got fallback data (even with error), use it
          setUser(userData);
          setUserCampaigns(userData.campaigns || []);
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('Failed to load profile data');
          
          // Fall back to mock data if API fails
          const mockUser = getMockUser();
          setUser({
            ...mockUser,
            id: session.user.id || 'temp-id',
            name: session.user.name || 'User',
            email: session.user.email || '',
            image: session.user.image || '',
            walletAddresses: mockUser.walletAddresses || {},
            campaigns: [],
            donations: []
          });
          setUserCampaigns(getUserCampaigns(mockUser.id));
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }
  }, [session]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Helper function to format USD values
  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // If loading or no user data, show loading state
  if (loading || !user) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
          <CircularProgress />
        </Box>
        <Footer />
      </Box>
    );
  }

  // Show error message if there was an error
  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
          <Paper sx={{ p: 4, maxWidth: 500 }}>
            <Typography variant="h6" color="error" gutterBottom>
              {error}
            </Typography>
            <Typography variant="body1">
              Using fallback data instead. Some features may be limited.
            </Typography>
          </Paper>
        </Box>
        <Footer />
      </Box>
    );
  }

  // Format currency amount
  const formatCurrency = (amount: number, currency: string): string => {
    return `${amount} ${currency}`;
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          py: 6,
          bgcolor: 'background.default'
        }}
      >
        <Container maxWidth="lg">
          {/* Profile Header */}
          <Paper sx={{ p: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'flex-start' }}>
              {/* Avatar Section */}
              <Box sx={{ width: { xs: '100%', md: 'auto' }, display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <Avatar 
                  src={user.image || undefined} 
                  alt={user.name || 'User'}
                  sx={{ width: 120, height: 120 }}
                />
              </Box>
              
              {/* User Info Section */}
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                  {user.name || 'User'}
                </Typography>
                <Typography variant="body1" paragraph>
                  {user.bio || 'No bio provided.'}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Object.entries(user.walletAddresses || {}).map(([currency, address]) => (
                    <Chip 
                      key={currency}
                      label={`${currency}: ${address}`}
                      variant="outlined"
                      color="primary"
                      size="small"
                    />
                  ))}
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Donated: {formatUSD(user.totalDonated || 0)}
                  </Typography>
                </Box>
              </Box>
              
              {/* Edit Profile Button */}
              <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' }, width: { xs: '100%', md: 'auto' } }}>
                {session && (
                  <Button 
                    component={Link}
                    href="/profile/edit"
                    variant="outlined"
                    startIcon={<EditIcon />}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
          
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
              <Tab label="My Campaigns" id="profile-tab-0" aria-controls="profile-tabpanel-0" />
              <Tab label="My Donations" id="profile-tab-1" aria-controls="profile-tabpanel-1" />
            </Tabs>
          </Box>
          
          {/* My Campaigns Tab */}
          <TabPanel value={tabValue} index={0}>
            {userCampaigns.length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                You haven&apos;t created any campaigns yet.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
                {userCampaigns.map((campaign) => (
                  <Box 
                    key={campaign.id} 
                    sx={{ 
                      width: { 
                        xs: '100%', 
                        sm: '50%', 
                        md: '33.333%' 
                      }, 
                      p: 1.5
                    }}
                  >
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardActionArea component={Link} href={`/campaign/${campaign.id}`}>
                        <CardMedia
                          component="img"
                          height="160"
                          image={campaign.image}
                          alt={campaign.title}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Chip 
                            label={campaign.category} 
                            size="small" 
                            color="primary" 
                            sx={{ mb: 1 }} 
                          />
                          <Typography variant="h6" component="h2" gutterBottom>
                            {campaign.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {campaign.description.length > 120 
                              ? `${campaign.description.substring(0, 120)}...` 
                              : campaign.description}
                          </Typography>
                          <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">
                              Goal: {campaign.goalAmount} {campaign.currency}
                            </Typography>
                            <Typography variant="body2">
                              Backers: {campaign.backers}
                            </Typography>
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Box>
                ))}
              </Box>
            )}
          </TabPanel>
          
          {/* My Donations Tab */}
          <TabPanel value={tabValue} index={1}>
            {(user.donations || []).length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                You haven&apos;t made any donations yet.
              </Typography>
            ) : (
              <Paper>
                <List>
                  {(user.donations || []).map((donation: Donation, index: number) => (
                    <React.Fragment key={donation.id || index}>
                      {index > 0 && <Divider component="li" />}
                      <ListItem alignItems="flex-start" component={Link} href={`/campaign/${donation.campaignId}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                        <ListItemAvatar>
                          <Avatar>
                            {(donation.currency || 'U').charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={donation.campaignTitle || 'Campaign'}
                          secondary={
                            <React.Fragment>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                {formatCurrency(donation.amount || 0, donation.currency || 'USD')}
                              </Typography>
                              {" — "}
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.secondary"
                              >
                                {formatUSD(donation.usdAmount || 0)} • {new Date(donation.timestamp || Date.now()).toLocaleDateString()}
                              </Typography>
                              {donation.message && (
                                <Typography
                                  component="p"
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mt: 1 }}
                                >
                                  &quot;{donation.message}&quot;
                                </Typography>
                              )}
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            )}
          </TabPanel>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
} 
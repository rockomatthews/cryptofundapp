'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Divider, 
  Button, 
  Chip,
  LinearProgress,
  CircularProgress,
  Alert
} from '@mui/material';
import { Grid } from '../../components/GridFix';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import DonationForm from '../../components/DonationForm';
import DonorLeaderboard from '../../components/DonorLeaderboard';
import Link from 'next/link';
import { getCampaignLeaderboard } from '../../lib/donationService';

interface CampaignData {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  image?: string;
  endDate?: Date;
  category?: string;
  user: { 
    id: string;
    name?: string;
  };
  updates: Array<{
    id: string;
    title: string;
    content: string;
  }>;
}

export default function CampaignPage({ params }: { params: { id: string } }) {
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCampaign() {
      try {
        const response = await fetch(`/api/campaign/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch campaign');
        }
        const data = await response.json();
        setCampaign(data);
      } catch (err) {
        console.error('Error fetching campaign:', err);
        setError('Failed to load campaign. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchCampaign();
  }, [params.id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <CircularProgress />
        </Box>
        <Footer />
      </Box>
    );
  }

  if (error || !campaign) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Container sx={{ py: 6 }}>
          <Alert severity="error">{error || 'Campaign not found'}</Alert>
          <Button 
            component={Link}
            href="/explore"
            variant="contained" 
            sx={{ mt: 2 }}
          >
            Back to All Campaigns
          </Button>
        </Container>
        <Footer />
      </Box>
    );
  }
  
  // Find the cryptocurrency usage update
  const cryptoUsagePlan = campaign.updates.find(update => 
    update.title === 'Cryptocurrency Usage Plan'
  )?.content || 'No cryptocurrency usage plan specified.';
  
  // Calculate funding progress
  const progress = Math.min(Math.round((campaign.raised / campaign.goal) * 100), 100);
  const daysLeft = campaign.endDate ? 
    Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 
    0;
  
  // Get leaderboard data
  const leaderboardDonations = getCampaignLeaderboard(campaign.id);
  
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
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            {/* Campaign details - left column */}
            <Box sx={{ flexBasis: { xs: '100%', md: '66.67%' } }}>
              <Paper sx={{ p: 0, mb: 4, overflow: 'hidden' }}>
                {campaign.image ? (
                  <Box 
                    component="img"
                    src={campaign.image}
                    alt={campaign.title}
                    sx={{ 
                      width: '100%',
                      height: 'auto',
                      maxHeight: '400px',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <Box 
                    sx={{ 
                      width: '100%',
                      height: '200px',
                      backgroundColor: 'grey.200',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No image available
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ p: 4 }}>
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {campaign.category && (
                      <Chip label={campaign.category} color="primary" size="small" />
                    )}
                    <Typography variant="body2" color="text.secondary">
                      Campaign ID: {campaign.id}
                    </Typography>
                  </Box>
                  
                  <Typography variant="h4" gutterBottom>
                    {campaign.title}
                  </Typography>
                  
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="body1" paragraph>
                      {campaign.description}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="h6" gutterBottom>
                    Cryptocurrency Usage
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {cryptoUsagePlan}
                  </Typography>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="h6" gutterBottom>
                    Campaign Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Created by</Typography>
                      <Typography variant="body1" gutterBottom>
                        {campaign.user.name || campaign.user.id}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">End Date</Typography>
                      <Typography variant="body1" gutterBottom>
                        {campaign.endDate 
                          ? new Date(campaign.endDate).toLocaleDateString() 
                          : 'No end date specified'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
              
              {/* Donor Leaderboard */}
              <DonorLeaderboard 
                donations={leaderboardDonations} 
                title="Top Supporters"
              />
            </Box>
            
            {/* Donation sidebar - right column */}
            <Box sx={{ flexBasis: { xs: '100%', md: '33.33%' } }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Funding Progress
                </Typography>
                
                <Typography variant="h4" color="primary" gutterBottom>
                  {campaign.raised} ETH
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  of {campaign.goal} ETH goal
                </Typography>
                
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  sx={{ height: 10, borderRadius: 5, my: 2 }} 
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {progress}% Funded
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {daysLeft > 0 ? `${daysLeft} days left` : 'Campaign ended'}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Backers
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {/* This would ideally come from the API */}
                    {leaderboardDonations.length}
                  </Typography>
                </Box>
              </Paper>
              
              {/* Donation Form */}
              <DonationForm campaignId={campaign.id} campaignTitle={campaign.title} />
              
              <Button 
                component={Link}
                href="/explore"
                variant="outlined" 
                fullWidth 
                sx={{ mt: 2 }}
              >
                Back to All Campaigns
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
} 
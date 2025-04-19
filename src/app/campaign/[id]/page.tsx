'use client';

import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Divider, 
  Button, 
  Chip,
  LinearProgress
} from '@mui/material';
import { Grid } from '../../components/GridFix';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import DonationForm from '../../components/DonationForm';
import DonorLeaderboard from '../../components/DonorLeaderboard';
import Link from 'next/link';
import { getCampaignLeaderboard } from '../../lib/donationService';

export default function CampaignPage({ params }: { params: { id: string } }) {
  // In a real app, this would fetch campaign data from an API
  // For demo purposes, we'll use a mock campaign
  const campaign = {
    id: params.id,
    title: "Blockchain-Based Supply Chain Tracking",
    description: "We're building a decentralized platform that uses blockchain technology to provide end-to-end visibility in global supply chains.",
    creator: "0x123abc...",
    goalAmount: 50,
    currency: "ETH",
    currentAmount: 28.5,
    backers: 42,
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    image: "https://images.unsplash.com/photo-1639744090758-c3d4fe323c84?ixlib=rb-4.0.3&auto=format&fit=crop&w=1024&q=80",
    category: "Infrastructure",
    projectPurpose: "Our platform uses Ethereum for smart contracts that automatically execute and enforce agreements between suppliers, manufacturers, and retailers. The cryptocurrency is used for transaction settlement and incentivizing honest reporting of supply chain data."
  };
  
  // Calculate funding progress
  const progress = Math.min(Math.round((campaign.currentAmount / campaign.goalAmount) * 100), 100);
  const daysLeft = Math.ceil((campaign.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  // Hardcode campaign ID for demo purposes to match our mock data
  const demoId = 'campaign-123456';
  const leaderboardDonations = getCampaignLeaderboard(demoId);
  
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
                
                <Box sx={{ p: 4 }}>
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip label={campaign.category} color="primary" size="small" />
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
                    {campaign.projectPurpose}
                  </Typography>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="h6" gutterBottom>
                    Campaign Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Created by</Typography>
                      <Typography variant="body1" gutterBottom>
                        {campaign.creator}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">End Date</Typography>
                      <Typography variant="body1" gutterBottom>
                        {campaign.endDate.toLocaleDateString()}
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
                  {campaign.currentAmount} {campaign.currency}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  of {campaign.goalAmount} {campaign.currency} goal
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
                    {daysLeft} days left
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Backers
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {campaign.backers}
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
import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Stack, 
  Grid,
  Paper
} from '@mui/material';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CampaignCard from './components/CampaignCard';
import Image from 'next/image';
import Link from 'next/link';

// Sample data for featured campaigns
const featuredCampaigns = [
  {
    id: '1',
    title: 'Decentralized Education Platform',
    description: 'Building a blockchain-based platform to make quality education accessible to everyone, everywhere.',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2864&auto=format&fit=crop',
    goalAmount: 50,
    currentAmount: 32.5,
    creatorName: 'EduDAO',
    daysLeft: 14
  },
  {
    id: '2',
    title: 'Green Mining Initiative',
    description: 'Developing sustainable mining solutions powered by renewable energy to reduce the carbon footprint of blockchain networks.',
    imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=2940&auto=format&fit=crop',
    goalAmount: 75,
    currentAmount: 42.8,
    creatorName: 'EcoBlock',
    daysLeft: 21
  },
  {
    id: '3',
    title: 'Community-Owned Marketplace',
    description: 'Creating a decentralized marketplace where creators can sell their digital products directly to consumers without middlemen.',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2940&auto=format&fit=crop',
    goalAmount: 30,
    currentAmount: 21.6,
    creatorName: 'MarketDAO',
    daysLeft: 9
  }
];

export default function Home() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          pt: 12,
          pb: 10,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={5} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                component="h1"
                variant="h2"
                color="text.primary"
                fontWeight="bold"
                gutterBottom
              >
                Fund the Future with Crypto
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                paragraph
                sx={{ mb: 4 }}
              >
                A decentralized crowdfunding platform that connects innovative projects
                with crypto backers. No middlemen, no fees, just pure blockchain-powered
                funding.
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
              >
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  component={Link}
                  href="/explore"
                >
                  Explore Projects
                </Button>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="large"
                  component={Link}
                  href="/create"
                >
                  Start a Campaign
                </Button>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  position: 'relative',
                  height: { xs: 300, md: 400 },
                  width: '100%',
                }}
              >
                <Image
                  src="/hero-image.png"
                  alt="Crypto funding illustration"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ py: 10, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography
            component="h2"
            variant="h3"
            color="text.primary"
            align="center"
            fontWeight="bold"
            gutterBottom
          >
            How It Works
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            align="center"
            sx={{ mb: 8, maxWidth: 800, mx: 'auto' }}
          >
            Our platform makes crypto crowdfunding simple, transparent, and secure.
          </Typography>
          
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'divider',
                  textAlign: 'center',
                }}
              >
                <Typography
                  component="h3"
                  variant="h5"
                  color="primary"
                  fontWeight="bold"
                  gutterBottom
                >
                  1. Create a Campaign
                </Typography>
                <Typography color="text.secondary">
                  Describe your project, set a funding goal, and add details that will get backers excited.
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'divider',
                  textAlign: 'center',
                }}
              >
                <Typography
                  component="h3"
                  variant="h5"
                  color="primary"
                  fontWeight="bold"
                  gutterBottom
                >
                  2. Attract Backers
                </Typography>
                <Typography color="text.secondary">
                  Share your campaign with the community and engage potential backers to support your vision.
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'divider',
                  textAlign: 'center',
                }}
              >
                <Typography
                  component="h3"
                  variant="h5"
                  color="primary"
                  fontWeight="bold"
                  gutterBottom
                >
                  3. Receive Funding
                </Typography>
                <Typography color="text.secondary">
                  Get funded directly to your wallet with smart contracts ensuring transparent fund management.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured Projects Section */}
      <Box sx={{ py: 10, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
            <Typography
              component="h2"
              variant="h3"
              color="text.primary"
              fontWeight="bold"
            >
              Featured Projects
            </Typography>
            <Button 
              variant="outlined" 
              component={Link} 
              href="/explore"
            >
              View All
            </Button>
          </Box>
          
          <Grid container spacing={4}>
            {featuredCampaigns.map((campaign) => (
              <Grid key={campaign.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <CampaignCard {...campaign} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}

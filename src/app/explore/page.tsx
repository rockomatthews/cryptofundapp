'use client';

import { 
  Box, 
  Container, 
  MenuItem, 
  Select, 
  TextField, 
  Typography,
  FormControl,
  InputLabel,
  Chip,
  InputAdornment,
  Pagination
} from '@mui/material';
import { Grid } from '../components/GridFix';
import { Search as SearchIcon, FilterList as FilterIcon } from '@mui/icons-material';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CampaignCard from '../components/CampaignCard';

// Sample data for campaigns
const campaigns = [
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
  },
  {
    id: '4',
    title: 'DeFi for the Unbanked',
    description: 'Building financial infrastructure to provide banking services to the 1.7 billion people without access to traditional banking.',
    imageUrl: 'https://images.unsplash.com/photo-1620120966883-d977b57a96ec?q=80&w=2832&auto=format&fit=crop',
    goalAmount: 100,
    currentAmount: 67.3,
    creatorName: 'InclusiveFinance',
    daysLeft: 30
  },
  {
    id: '5',
    title: 'Decentralized Identity Solution',
    description: 'Creating a self-sovereign identity system that gives individuals control over their personal data.',
    imageUrl: 'https://images.unsplash.com/photo-1558222218-b7b54eede3f3?q=80&w=2874&auto=format&fit=crop',
    goalAmount: 40,
    currentAmount: 12.8,
    creatorName: 'IdentityDAO',
    daysLeft: 18
  },
  {
    id: '6',
    title: 'Crypto Art Collective',
    description: 'Supporting digital artists through a community-owned platform for NFT creation and exhibition.',
    imageUrl: 'https://images.unsplash.com/photo-1578926288207-32516d103d90?q=80&w=2940&auto=format&fit=crop',
    goalAmount: 25,
    currentAmount: 18.2,
    creatorName: 'ArtistsUnited',
    daysLeft: 7
  }
];

// Categories for filtering
const categories = [
  'All Categories',
  'DeFi',
  'NFT',
  'Gaming',
  'Infrastructure',
  'Social Impact',
  'Education',
  'Environment'
];

export default function Explore() {
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
          <Typography
            component="h1"
            variant="h3"
            color="text.primary"
            fontWeight="bold"
            gutterBottom
          >
            Explore Campaigns
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Discover innovative blockchain projects seeking funding
          </Typography>
          
          {/* Search and Filter Section */}
          <Box sx={{ mb: 6 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search for campaigns..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    defaultValue="All Categories"
                    label="Category"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="sort-label">Sort By</InputLabel>
                  <Select
                    labelId="sort-label"
                    defaultValue="Most Popular"
                    label="Sort By"
                  >
                    <MenuItem value="Most Popular">Most Popular</MenuItem>
                    <MenuItem value="Newest">Newest</MenuItem>
                    <MenuItem value="Ending Soon">Ending Soon</MenuItem>
                    <MenuItem value="Most Funded">Most Funded</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                <FilterIcon fontSize="small" sx={{ mr: 0.5 }} />
                Active Filters:
              </Typography>
              <Chip label="Social Impact" onDelete={() => {}} size="small" />
              <Chip label="Most Funded" onDelete={() => {}} size="small" />
            </Box>
          </Box>
          
          {/* Campaigns Grid */}
          <Grid container spacing={4}>
            {campaigns.map((campaign) => (
              <Grid item key={campaign.id} xs={12} sm={6} md={4}>
                <CampaignCard {...campaign} />
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination */}
          <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
            <Pagination count={10} color="primary" size="large" />
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
} 
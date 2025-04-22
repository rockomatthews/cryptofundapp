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
  Pagination,
  CircularProgress,
  Alert
} from '@mui/material';
import { useState, useEffect } from 'react';
import { Grid } from '../components/GridFix';
import { Search as SearchIcon, FilterList as FilterIcon } from '@mui/icons-material';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CampaignCard from '../components/CampaignCard';

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
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });
  
  // Filter states
  const [category, setCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('createdAt');
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  
  // Fetch campaigns on initial load and when filters change
  useEffect(() => {
    fetchCampaigns();
  }, [category, sortBy, pagination.page, search]);
  
  // Function to fetch campaigns from API
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (category !== 'All Categories') params.append('category', category);
      params.append('sortBy', sortBy);
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      if (search) params.append('search', search);
      
      // Make API request
      const response = await fetch(`/api/campaign?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }
      
      const data = await response.json();
      
      // Update state with fetched data
      setCampaigns(data.campaigns);
      setPagination({
        ...pagination,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      });
      
      // Update active filters
      const filters = [];
      if (category !== 'All Categories') filters.push(category);
      if (sortBy !== 'createdAt') filters.push(getSortLabel(sortBy));
      if (search) filters.push(`Search: "${search}"`);
      setActiveFilters(filters);
      
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Get readable label for sort options
  const getSortLabel = (sort) => {
    switch (sort) {
      case 'endDate':
        return 'Ending Soon';
      case 'goal':
        return 'Highest Goal';
      case 'raised':
        return 'Most Raised';
      case 'mostFunded':
        return 'Most Funded';
      default:
        return 'Newest';
    }
  };
  
  // Handle filter changes
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPagination({ ...pagination, page: 1 }); // Reset to first page
  };
  
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPagination({ ...pagination, page: 1 }); // Reset to first page
  };
  
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };
  
  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      setPagination({ ...pagination, page: 1 }); // Reset to first page
      fetchCampaigns();
    }
  };
  
  const handlePageChange = (event, value) => {
    setPagination({ ...pagination, page: value });
  };
  
  const handleRemoveFilter = (filter) => {
    if (categories.includes(filter)) {
      setCategory('All Categories');
    } else if (filter.startsWith('Search:')) {
      setSearch('');
    } else {
      setSortBy('createdAt');
    }
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
                  value={search}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchSubmit}
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
                    value={category}
                    onChange={handleCategoryChange}
                    label="Category"
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
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
                    value={sortBy}
                    onChange={handleSortChange}
                    label="Sort By"
                  >
                    <MenuItem value="createdAt">Newest</MenuItem>
                    <MenuItem value="endDate">Ending Soon</MenuItem>
                    <MenuItem value="goal">Highest Goal</MenuItem>
                    <MenuItem value="raised">Most Raised</MenuItem>
                    <MenuItem value="mostFunded">Most Funded</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            {activeFilters.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                  <FilterIcon fontSize="small" sx={{ mr: 0.5 }} />
                  Active Filters:
                </Typography>
                {activeFilters.map((filter) => (
                  <Chip 
                    key={filter} 
                    label={filter} 
                    onDelete={() => handleRemoveFilter(filter)} 
                    size="small" 
                  />
                ))}
              </Box>
            )}
          </Box>
          
          {/* Loading, Error and Empty States */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
              <CircularProgress />
            </Box>
          )}
          
          {error && !loading && (
            <Alert severity="error" sx={{ my: 4 }}>
              Error loading campaigns: {error}
            </Alert>
          )}
          
          {!loading && !error && campaigns.length === 0 && (
            <Alert severity="info" sx={{ my: 4 }}>
              No campaigns found matching your criteria. Try adjusting your filters.
            </Alert>
          )}
          
          {/* Campaigns Grid */}
          {!loading && !error && campaigns.length > 0 && (
            <Grid container spacing={4}>
              {campaigns.map((campaign) => (
                <Grid item key={campaign.id} xs={12} sm={6} md={4}>
                  <CampaignCard
                    id={campaign.id}
                    title={campaign.title}
                    description={campaign.description.split('\n\n')[0]} // Use first paragraph
                    imageUrl={campaign.image || 'https://images.unsplash.com/photo-1620120966883-d977b57a96ec?q=80&w=2832&auto=format&fit=crop'}
                    goalAmount={campaign.goal}
                    currentAmount={campaign.raised}
                    creatorName={campaign.creatorName}
                    daysLeft={campaign.daysLeft}
                  />
                </Grid>
              ))}
            </Grid>
          )}
          
          {/* Pagination */}
          {!loading && !error && pagination.totalPages > 1 && (
            <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
              <Pagination 
                count={pagination.totalPages} 
                page={pagination.page} 
                onChange={handlePageChange}
                color="primary" 
                size="large" 
              />
            </Box>
          )}
        </Container>
      </Box>

      <Footer />
    </Box>
  );
} 
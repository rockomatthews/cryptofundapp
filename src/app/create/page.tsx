'use client';

import React, { useState, useRef } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  SelectChangeEvent,
  IconButton,
  Chip,
  Stack
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import AddIcon from '@mui/icons-material/Add';
import { Grid } from '../components/GridFix';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
// Remove problematic import temporarily
// import CurrencySelector from '../components/CurrencySelector';

// Mock CurrencySelector component with cryptocurrency options as buttons
const CurrencySelector = ({ initialValue, onChange }: { initialValue: string; onChange: (currency: string, amount: string) => void }) => {
  const [selectedCurrency, setSelectedCurrency] = useState(initialValue);
  
  // Cryptocurrencies supported for fundraising
  const currencies = [
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'USDT', name: 'Tether' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'DOT', name: 'Polkadot' },
    { symbol: 'ADA', name: 'Cardano' }
  ];
  
  const handleCurrencyChange = (symbol: string) => {
    console.log('Currency changed to:', symbol);
    setSelectedCurrency(symbol);
    onChange(symbol, '');
  };
  
  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={1}>
          {currencies.map((crypto) => (
            <Grid item xs={4} sm={2} key={crypto.symbol}>
              <Paper
                elevation={selectedCurrency === crypto.symbol ? 3 : 0}
                variant={selectedCurrency === crypto.symbol ? "elevation" : "outlined"}
                sx={{
                  p: 1,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: selectedCurrency === crypto.symbol ? 'primary.light' : 'background.paper',
                  color: selectedCurrency === crypto.symbol ? 'primary.contrastText' : 'text.primary',
                  borderColor: selectedCurrency === crypto.symbol ? 'primary.main' : 'divider',
                  '&:hover': {
                    backgroundColor: selectedCurrency === crypto.symbol ? 'primary.light' : 'action.hover',
                    transform: 'translateY(-2px)',
                  },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onClick={() => handleCurrencyChange(crypto.symbol)}
              >
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                  {crypto.symbol}
                </Typography>
                <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  {crypto.name}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      <TextField
        fullWidth
        label="Amount"
        type="text"
        placeholder="Enter amount"
        InputProps={{
          startAdornment: <InputAdornment position="start">{selectedCurrency}</InputAdornment>,
          inputProps: {
            inputMode: 'decimal',
            pattern: '[0-9]*[.]?[0-9]*'
          }
        }}
        required
      />
    </Box>
  );
};

// Categories for campaign creation
const categories = [
  'DeFi',
  'NFT',
  'Gaming',
  'Infrastructure',
  'Social Impact',
  'Education',
  'Environment',
  'Art & Culture',
  'Technology',
  'Health'
];

export default function CreateCampaign() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [socialMediaLinks, setSocialMediaLinks] = useState<string[]>([]);
  const [socialMediaInput, setSocialMediaInput] = useState('');
  const [campaignImage, setCampaignImage] = useState<string | null>(null);
  const [campaignImageFile, setCampaignImageFile] = useState<File | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    currency: 'ETH',
    amount: '0',
    duration: '',
    shortDescription: '',
    detailedDescription: '',
    website: '',
    imageUrl: '',
    cryptoUsagePlan: '',
    creatorName: '',
    contactEmail: '',
    socialMedia: ''
  });
  
  const [paymentInfo, setPaymentInfo] = useState<{
    paymentId?: string;
    status?: string;
    walletAddress?: string;
    address?: string;
    destinationWallet?: string;
  } | null>(null);
  
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
      setCampaignImageFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setCampaignImage(reader.result as string);
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle social media input
  const handleSocialMediaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSocialMediaInput(e.target.value);
  };

  // Handle key press in social media input
  const handleSocialMediaKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSocialMediaLink();
    }
  };
  
  // Extract domain name from URL
  const extractDomainName = (url: string) => {
    try {
      let processedUrl = url;
      if (!url.match(/^https?:\/\//i)) {
        processedUrl = 'https://' + url;
      }
      
      const domain = new URL(processedUrl).hostname;
      // Get the domain name without www. and .com/.org/etc.
      return domain.replace(/^www\./i, '').split('.')[0];
    } catch {
      // Just return the original text if not a valid URL
      return url;
    }
  };

  // Add social media link
  const addSocialMediaLink = () => {
    if (socialMediaInput.trim()) {
      const newLinks = [...socialMediaLinks, socialMediaInput.trim()];
      setSocialMediaLinks(newLinks);
      setSocialMediaInput('');
      
      // Update formData with concatenated links
      setFormData(prev => ({ 
        ...prev, 
        socialMedia: newLinks.join(',') 
      }));
    }
  };

  // Delete a social media link
  const deleteSocialMediaLink = (index: number) => {
    const newLinks = socialMediaLinks.filter((_, i) => i !== index);
    setSocialMediaLinks(newLinks);
    
    // Update formData
    setFormData(prev => ({ 
      ...prev, 
      socialMedia: newLinks.join(',') 
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (e: SelectChangeEvent) => {
    const name = e.target.name as string;
    const value = e.target.value as string;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCurrencyChange = (currency: string, newAmount: string) => {
    // Ensure amount is never empty
    const amount = newAmount && newAmount.trim() !== '' ? newAmount : '0';
    setFormData(prev => ({ ...prev, currency, amount }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.category || !formData.amount || !formData.duration || 
        !formData.shortDescription || !formData.detailedDescription || !formData.cryptoUsagePlan ||
        !formData.creatorName || !formData.contactEmail) {
      setErrorMessage('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      // Upload image data
      let imageData = formData.imageUrl;
      
      if (campaignImageFile && campaignImage) {
        // In a real app, you would upload the file to a storage service 
        // For demo purposes, the base64 data from the FileReader is used
        imageData = campaignImage;
      }
      
      // Create payload with image data
      const payload = {
        ...formData,
        imageUrl: imageData || ''
      };
      
      // Call API to create a new campaign
      const response = await fetch('/api/campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const { data } = await response.json();
      
      // Check if payment is required
      if (data.requiresPayment && data.paymentInfo) {
        setPaymentInfo(data.paymentInfo);
        
        // Show wallet setup notice if needed
        if (data.needsWalletSetup) {
          toast('Important: You need to set up your wallet in your profile to receive funds');
        }
        
        return;
      }
      
      // Show wallet setup notice if needed
      if (data.needsWalletSetup) {
        toast('Important: Please set up your wallet address in your profile to receive funds for this campaign');
        
        // Redirect to profile edit page after a short delay
        setTimeout(() => {
          router.push('/profile/edit');
        }, 5000);
        return;
      }
      
      // Show success message
      setSuccessMessage('Campaign created successfully! Redirecting to campaign page...');
      
      // Redirect to the newly created campaign page
      setTimeout(() => {
        router.push(`/campaign/${data.campaign.id}`);
      }, 2000);
    } catch {
      toast.error('Failed to create campaign. Please try again.');
      setIsSubmitting(false);
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
        <Container maxWidth="md">
          <Typography
            component="h1"
            variant="h3"
            color="text.primary"
            fontWeight="bold"
            gutterBottom
          >
            Start Your Campaign
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Create a new fundraising campaign to bring your blockchain project to life
          </Typography>
          
          <Paper sx={{ p: 4 }}>
            <Alert 
              severity="info" 
              sx={{ mb: 4 }}
            >
              Please ensure you&apos;ve connected your wallet before creating a campaign.
              All funds will be managed through secure smart contracts via the CryptoProcessing API.
            </Alert>
            
            {/* Campaign Form */}
            <form onSubmit={handleSubmit}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Basic Information
              </Typography>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="campaign-title"
                    name="title"
                    label="Campaign Title"
                    placeholder="Enter a clear, specific title for your campaign"
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                      labelId="category-label"
                      id="category"
                      name="category"
                      label="Category"
                      value={formData.category}
                      onChange={handleSelectChange}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Funding Goal*
                    </Typography>
                    <CurrencySelector 
                      initialValue={formData.amount}
                      onChange={handleCurrencyChange}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="duration"
                    name="duration"
                    label="Campaign Duration"
                    type="number"
                    value={formData.duration}
                    onChange={handleInputChange}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">Days</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 4 }} />
              
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Campaign Details
              </Typography>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="short-description"
                    name="shortDescription"
                    label="Short Description"
                    placeholder="A brief summary of your campaign (100-150 characters)"
                    multiline
                    rows={2}
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="detailed-description"
                    name="detailedDescription"
                    label="Detailed Description"
                    placeholder="Explain your project in detail, why it matters, and how funds will be used"
                    multiline
                    rows={6}
                    value={formData.detailedDescription}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="website"
                    name="website"
                    label="Campaign Website"
                    placeholder="https://your-project-website.com"
                    value={formData.website}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Campaign Image
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        position: 'relative',
                        width: 150,
                        height: 150,
                        border: '2px dashed',
                        borderColor: 'divider',
                        borderRadius: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      {campaignImage ? (
                        <Box 
                          component="img" 
                          src={campaignImage}
                          sx={{ 
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                          alt="Campaign preview"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary" align="center">
                          No image selected
                        </Typography>
                      )}
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
                        size="large"
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
                    <Box>
                      <Typography variant="body2">
                        Upload a high-quality image for your campaign banner (1200x630px recommended)
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Supported formats: JPG, PNG, GIF
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 4 }} />
              
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Cryptocurrency Usage
              </Typography>
              <Alert 
                severity="info" 
                sx={{ mb: 3 }}
              >
                Projects on CryptoFund must demonstrate how they&apos;ll use the cryptocurrency they&apos;re raising in their actual operations.
              </Alert>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="crypto-usage"
                    name="cryptoUsagePlan"
                    label="Cryptocurrency Usage Plan"
                    placeholder="Explain in detail how your project will use the cryptocurrency being raised (e.g., as a utility token, for transaction processing, etc.)"
                    multiline
                    rows={4}
                    value={formData.cryptoUsagePlan}
                    onChange={handleInputChange}
                  />
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 4 }} />
              
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Creator Details
              </Typography>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="creator-name"
                    name="creatorName"
                    label="Creator Name or Organization"
                    placeholder="Your name or organization name"
                    value={formData.creatorName}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="contact-email"
                    name="contactEmail"
                    label="Contact Email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Social Media Links (Twitter, Discord, GitHub, etc.)
                  </Typography>
                  <Typography variant="caption" color="text.secondary" paragraph>
                    Add links to your social media profiles. Press Enter or comma (,) after each link.
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      value={socialMediaInput}
                      onChange={handleSocialMediaInputChange}
                      onKeyDown={handleSocialMediaKeyPress}
                      placeholder="https://twitter.com/yourhandle"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={addSocialMediaLink} edge="end">
                              <AddIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                  
                  {socialMediaLinks.length > 0 && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                      {socialMediaLinks.map((link, index) => (
                        <Chip
                          key={index}
                          label={extractDomainName(link)}
                          onDelete={() => deleteSocialMediaLink(index)}
                          color="primary"
                          variant="outlined"
                          clickable
                          component="a"
                          href={link.match(/^https?:\/\//i) ? link : `https://${link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ))}
                    </Stack>
                  )}
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 4 }} />
              
              {errorMessage && (
                <Alert severity="error" sx={{ mb: 3 }}>{errorMessage}</Alert>
              )}
              
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="outlined" size="large">
                  Save Draft
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  disabled={isSubmitting}
                  startIcon={isSubmitting && <CircularProgress size={20} color="inherit" />}
                >
                  {isSubmitting ? 'Creating...' : 'Create Campaign'}
                </Button>
              </Box>
            </form>
          </Paper>
        </Container>
      </Box>

      <Footer />
      
      <Snackbar
        open={!!successMessage}
        message={successMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      {paymentInfo && (
        <Box sx={{ mt: 4, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Campaign Creation Fee: $10
          </Typography>
          <Typography variant="body1" paragraph>
            Please send the payment to the following address:
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', my: 2, p: 2, bgcolor: 'background.paper' }}>
            {paymentInfo.address}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Payment ID: {paymentInfo.paymentId}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Status: {paymentInfo.status}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Destination Wallet: {paymentInfo.destinationWallet || "Platform wallet"}
          </Typography>
          <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
            Once payment is confirmed, your campaign will be created automatically. Payment confirmations typically take 10-30 minutes depending on network congestion.
          </Alert>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => {
              // Poll payment status every 10 seconds
              const checkPayment = async () => {
                try {
                  const response = await fetch(`/api/payment/status?paymentId=${paymentInfo.paymentId}`);
                  const data = await response.json();
                  
                  if (data.status === 'completed') {
                    toast.success('Payment completed! Redirecting to your new campaign...');
                    setPaymentInfo({...paymentInfo, status: 'completed'});
                    setTimeout(() => {
                      router.push('/campaigns');
                    }, 2000);
                  } else {
                    setPaymentInfo({...paymentInfo, status: data.status || 'pending'});
                    toast(`Payment status: ${data.status || 'pending'}`);
                  }
                } catch {
                  toast.error('Failed to check payment status. Please try again.');
                }
              };
              
              checkPayment();
              const interval = setInterval(checkPayment, 10000);
              
              // Clear interval after 15 minutes
              setTimeout(() => clearInterval(interval), 15 * 60 * 1000);
            }}
          >
            Check Payment Status
          </Button>
        </Box>
      )}
    </Box>
  );
} 
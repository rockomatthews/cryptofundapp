'use client';

import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  CircularProgress,
  InputAdornment,
  Grid,
  Paper
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface PaymentFormProps {
  campaignId: string;
  campaignTitle: string;
  minAmount?: number;
}

// Expanded list of cryptocurrencies
const CRYPTOCURRENCIES = [
  { id: 'BTC', name: 'Bitcoin' },
  { id: 'ETH', name: 'Ethereum' },
  { id: 'USDT', name: 'Tether' },
  { id: 'XRP', name: 'Ripple' },
  { id: 'LTC', name: 'Litecoin' },
  { id: 'ADA', name: 'Cardano' },
  { id: 'DOT', name: 'Polkadot' },
  { id: 'DOGE', name: 'Dogecoin' },
  { id: 'BNB', name: 'Binance Coin' },
  { id: 'SOL', name: 'Solana' },
  { id: 'USDC', name: 'USD Coin' },
  { id: 'AVAX', name: 'Avalanche' }
];

export default function PaymentForm({ campaignId, campaignTitle, minAmount = 0.01 }: PaymentFormProps) {
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<string>('ETH');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { status } = useSession();
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (status !== 'authenticated') {
      // Redirect to sign in page
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(`/campaign/${campaignId}`));
      return;
    }
    
    // Validate amount
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < minAmount) {
      setError(`Minimum contribution amount is ${minAmount} ${currency}`);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create payment via API
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: numAmount,
          currency,
          description: `Contribution to campaign: ${campaignTitle}`,
          campaignId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process payment');
      }
      
      // Redirect to payment page
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        throw new Error('Missing payment redirect URL');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
  };
  
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Support this Campaign
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Typography variant="subtitle2" gutterBottom>
          Select cryptocurrency
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={1}>
            {CRYPTOCURRENCIES.map((crypto) => (
              <Grid size={{ xs: 3 }} key={crypto.id}>
                <Paper
                  elevation={0}
                  variant={currency === crypto.id ? "elevation" : "outlined"}
                  sx={{
                    p: 1,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: currency === crypto.id ? 'primary.light' : 'background.paper',
                    color: currency === crypto.id ? 'primary.contrastText' : 'text.primary',
                    borderColor: currency === crypto.id ? 'primary.main' : 'divider',
                    '&:hover': {
                      backgroundColor: currency === crypto.id ? 'primary.light' : 'action.hover',
                      transform: 'translateY(-2px)',
                    },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onClick={() => handleCurrencyChange(crypto.id)}
                >
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                    {crypto.id}
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
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="text"
          placeholder="Enter amount"
          InputProps={{
            startAdornment: <InputAdornment position="start">{currency}</InputAdornment>,
            inputProps: {
              inputMode: 'decimal',
              pattern: '[0-9]*[.]?[0-9]*'
            }
          }}
          sx={{ mb: 2 }}
          disabled={loading}
        />
        
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          fullWidth 
          disabled={loading || !amount}
          sx={{ py: 1.5 }}
        >
          {loading ? <CircularProgress size={24} /> : `Contribute ${amount ? `${amount} ${currency}` : ''}`}
        </Button>
        
        {status !== 'authenticated' && (
          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            You will need to sign in before completing your contribution
          </Typography>
        )}
      </form>
    </Box>
  );
} 
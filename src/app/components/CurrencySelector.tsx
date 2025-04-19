'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Grid, 
  Paper, 
  Typography, 
  InputAdornment 
} from '@mui/material';
import { SUPPORTED_CURRENCIES } from '@/lib/wormhole/bridge';
import { getTokenPrice } from '@/lib/solana/jupiter';

interface CurrencySelectorProps {
  initialValue: string;
  onChange: (currency: string, amount: string) => void;
}

const CurrencySelector = ({ initialValue, onChange }: CurrencySelectorProps) => {
  const [selectedCurrency, setSelectedCurrency] = useState(initialValue || 'ETH');
  const [amount, setAmount] = useState('0');
  const [usdValue, setUsdValue] = useState('0.00');
  
  // Convert currencies to array for easier mapping
  const currencies = Object.entries(SUPPORTED_CURRENCIES).map(([symbol, data]) => ({
    symbol,
    ...data
  }));

  // Update USD value when currency or amount changes
  useEffect(() => {
    const updateUsdValue = async () => {
      if (!amount || isNaN(parseFloat(amount))) {
        setUsdValue('0.00');
        return;
      }

      try {
        // In a real implementation, we would use the token price from an API
        // For this example, we'll use a placeholder
        const tokenInfo = SUPPORTED_CURRENCIES[selectedCurrency as keyof typeof SUPPORTED_CURRENCIES];
        const tokenAddress = tokenInfo.wrappedSolanaAddress;
        
        // This is just a placeholder - in reality, this would call getTokenPrice
        // const price = await getTokenPrice(tokenAddress);
        const price = getPlaceholderPrice(selectedCurrency);
        
        const parsedAmount = parseFloat(amount);
        const usdAmount = parsedAmount * price;
        setUsdValue(usdAmount.toFixed(2));
      } catch (error) {
        console.error('Error fetching price:', error);
        setUsdValue('0.00');
      }
    };

    updateUsdValue();
  }, [selectedCurrency, amount]);

  // Placeholder function to get token prices
  const getPlaceholderPrice = (symbol: string): number => {
    const prices: Record<string, number> = {
      'ETH': 3500,
      'BTC': 65000,
      'USDT': 1,
      'SOL': 140,
      'DOT': 8,
      'ADA': 0.5
    };
    return prices[symbol] || 0;
  };

  const handleCurrencyChange = (symbol: string) => {
    setSelectedCurrency(symbol);
    onChange(symbol, amount);
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value;
    setAmount(newAmount);
    onChange(selectedCurrency, newAmount);
  };
  
  // Set initial currency and amount when component mounts
  useEffect(() => {
    onChange(selectedCurrency, amount);
  }, []);

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
        value={amount}
        onChange={handleAmountChange}
        placeholder="Enter amount"
        InputProps={{
          startAdornment: <InputAdornment position="start">{selectedCurrency}</InputAdornment>,
          endAdornment: <InputAdornment position="end">≈ ${usdValue} USD</InputAdornment>,
          inputProps: {
            inputMode: 'decimal',
            pattern: '[0-9]*[.]?[0-9]*'
          }
        }}
        required
      />
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        {selectedCurrency !== 'SOL' && selectedCurrency !== 'USDT' ? 
          `Note: ${selectedCurrency} will be bridged to Solana via Wormhole. Bridge fees apply.` : 
          `Native ${selectedCurrency} on Solana will be used directly.`}
      </Typography>
    </Box>
  );
};

export default CurrencySelector; 
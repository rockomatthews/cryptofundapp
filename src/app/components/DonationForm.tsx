'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert, 
  AlertTitle, 
  InputAdornment,
  Divider,
  CircularProgress
} from '@mui/material';
import { Grid } from '../components/GridFix';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { cryptoPaymentProcessor, type PaymentRequest, type WalletConnection } from '../lib/paymentProcessor';

interface DonationFormProps {
  campaignId: string;
  campaignTitle: string;
}

export default function DonationForm({ campaignId, campaignTitle }: DonationFormProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [transactionId, setTransactionId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [connectedWallets, setConnectedWallets] = useState<WalletConnection[]>([]);
  
  // Currencies supported for donations
  const currencies = [
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'USDT', name: 'Tether' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'DOT', name: 'Polkadot' },
    { symbol: 'ADA', name: 'Cardano' }
  ];
  
  // Update connected wallets list
  useEffect(() => {
    // In a real app, we'd sync with connected wallets on mount and when they change
    const wallets = cryptoPaymentProcessor.getConnectedWallets();
    setConnectedWallets(wallets);
    
    // If we have a connected wallet, set it as the selected currency
    if (wallets.length > 0 && !selectedCurrency) {
      setSelectedCurrency(wallets[0].walletType);
    }
  }, [selectedCurrency]);
  
  const isWalletConnected = (currency: string): boolean => {
    return connectedWallets.some(wallet => wallet.walletType === currency);
  };
  
  const getWalletAddress = (currency: string): string => {
    const wallet = connectedWallets.find(wallet => wallet.walletType === currency);
    return wallet ? wallet.address : '';
  };
  
  const handleCurrencySelect = (currency: string) => {
    setSelectedCurrency(currency);
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and a single decimal point
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };
  
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };
  
  const handleDonate = async () => {
    if (!selectedCurrency) {
      setErrorMessage('Please select a cryptocurrency');
      return;
    }
    
    if (!isWalletConnected(selectedCurrency)) {
      setErrorMessage(`Please connect your ${selectedCurrency} wallet first`);
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setErrorMessage('Please enter a valid amount');
      return;
    }
    
    setIsProcessing(true);
    setErrorMessage('');
    
    try {
      const paymentRequest: PaymentRequest = {
        campaignId,
        amount: parseFloat(amount),
        currency: selectedCurrency,
        walletAddress: getWalletAddress(selectedCurrency),
        message: message || undefined
      };
      
      const result = await cryptoPaymentProcessor.processDonation(paymentRequest);
      
      // Handle successful donation
      setTransactionStatus('success');
      setTransactionId(result.transactionId);
    } catch (error) {
      // Handle donation failure
      console.error('Donation failed:', error);
      setTransactionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process donation');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const resetForm = () => {
    setAmount('');
    setMessage('');
    setTransactionStatus('idle');
    setTransactionId('');
    setErrorMessage('');
  };
  
  if (transactionStatus === 'success') {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Alert severity="success" sx={{ mb: 2 }}>
          <AlertTitle>Donation Successful!</AlertTitle>
          Thank you for your donation of {amount} {selectedCurrency} to {campaignTitle}
        </Alert>
        <Typography variant="body2" gutterBottom>
          Transaction ID: {transactionId}
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Button variant="outlined" onClick={resetForm}>
            Make Another Donation
          </Button>
        </Box>
      </Paper>
    );
  }
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Alert severity="warning" sx={{ mb: 2 }}>
        <AlertTitle>Important</AlertTitle>
        Your donation will be processed through the CryptoProcessing payment gateway. 
        You must have the appropriate wallet extension installed (MetaMask for ETH/USDT, 
        Phantom for SOL, etc.) to complete your donation.
      </Alert>
      
      <Typography variant="h6" gutterBottom>
        Support This Campaign
      </Typography>
      
      {connectedWallets.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>No Wallets Connected</AlertTitle>
          Please connect at least one cryptocurrency wallet from the &quot;Connect Wallet&quot; button in the navigation bar to make a donation.
        </Alert>
      ) : (
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>Connected Wallets</AlertTitle>
          You have {connectedWallets.length} wallet(s) connected: {connectedWallets.map(w => w.walletType).join(', ')}
        </Alert>
      )}
      
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Select Cryptocurrency
        </Typography>
        <Grid container spacing={1}>
          {currencies.map((crypto) => {
            const isConnected = isWalletConnected(crypto.symbol);
            
            return (
              <Grid item xs={4} sm={2} key={crypto.symbol}>
                <Paper
                  elevation={selectedCurrency === crypto.symbol ? 3 : 0}
                  variant={selectedCurrency === crypto.symbol ? "elevation" : "outlined"}
                  sx={{
                    p: 1,
                    textAlign: 'center',
                    cursor: isConnected ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    backgroundColor: selectedCurrency === crypto.symbol 
                      ? 'primary.light' 
                      : isConnected ? 'background.paper' : 'action.disabledBackground',
                    color: isConnected 
                      ? (selectedCurrency === crypto.symbol ? 'primary.contrastText' : 'text.primary')
                      : 'text.disabled',
                    borderColor: selectedCurrency === crypto.symbol ? 'primary.main' : 'divider',
                    opacity: isConnected ? 1 : 0.6,
                    '&:hover': {
                      backgroundColor: isConnected 
                        ? (selectedCurrency === crypto.symbol ? 'primary.light' : 'action.hover')
                        : 'action.disabledBackground',
                      transform: isConnected ? 'translateY(-2px)' : 'none',
                    },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative'
                  }}
                  onClick={() => isConnected && handleCurrencySelect(crypto.symbol)}
                >
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                    {crypto.symbol}
                  </Typography>
                  <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' } }}>
                    {crypto.name}
                  </Typography>
                  
                  {!isConnected && (
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 2, 
                      right: 2, 
                      width: 10, 
                      height: 10, 
                      borderRadius: '50%',
                      bgcolor: 'error.main'
                    }} />
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
      
      <TextField
        fullWidth
        label="Amount"
        value={amount}
        onChange={handleAmountChange}
        type="text"
        placeholder="Enter donation amount"
        InputProps={{
          startAdornment: <InputAdornment position="start">{selectedCurrency || 'Select'}</InputAdornment>,
        }}
        disabled={!selectedCurrency || !isWalletConnected(selectedCurrency)}
        sx={{ mb: 2 }}
        required
      />
      
      <TextField
        fullWidth
        label="Message (Optional)"
        value={message}
        onChange={handleMessageChange}
        placeholder="Add a message with your donation"
        multiline
        rows={2}
        disabled={!selectedCurrency || !isWalletConnected(selectedCurrency)}
        sx={{ mb: 3 }}
      />
      
      <Button
        variant="contained"
        color="primary"
        fullWidth
        disabled={isProcessing || !selectedCurrency || !amount || !isWalletConnected(selectedCurrency)}
        onClick={handleDonate}
        startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <AccountBalanceWalletIcon />}
      >
        {isProcessing ? 'Processing...' : `Donate ${amount ? amount : ''} ${selectedCurrency || ''}`}
      </Button>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="body2" color="text.secondary">
        Your donation will be processed securely through the blockchain. Transaction fees may apply depending on network conditions.
      </Typography>
    </Paper>
  );
} 
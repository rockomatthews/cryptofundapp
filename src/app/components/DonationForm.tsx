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
  CircularProgress,
  Snackbar
} from '@mui/material';
import { Grid } from '../components/GridFix';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { cryptoPaymentProcessor, type PaymentRequest, type WalletConnection } from '../lib/paymentProcessor';

interface CryptoCurrency {
  symbol: string;
  name: string;
  provider: string;
}

interface DonationFormProps {
  campaignId: string;
  campaignTitle: string;
}

export default function DonationForm({ campaignId, campaignTitle }: DonationFormProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [transactionId, setTransactionId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [connectedWallets, setConnectedWallets] = useState<WalletConnection[]>([]);
  const [errorNotification, setErrorNotification] = useState<string>('');
  
  // Currencies supported for donations with their providers
  const currencies: CryptoCurrency[] = [
    { symbol: 'ETH', name: 'Ethereum', provider: 'metamask' },
    { symbol: 'BTC', name: 'Bitcoin', provider: 'bitpay' },
    { symbol: 'USDT', name: 'Tether', provider: 'metamask' },
    { symbol: 'SOL', name: 'Solana', provider: 'phantom' },
    { symbol: 'DOT', name: 'Polkadot', provider: 'polkadot-js' },
    { symbol: 'ADA', name: 'Cardano', provider: 'nami' }
  ];
  
  // Update connected wallets list on component mount
  useEffect(() => {
    try {
      const wallets = cryptoPaymentProcessor.getConnectedWallets();
      setConnectedWallets(wallets);
    } catch (error) {
      console.error('Error getting connected wallets:', error);
      setErrorNotification('Failed to retrieve wallet information. Please refresh the page.');
    }
  }, []);
  
  const isWalletConnected = (currency: string): boolean => {
    return connectedWallets.some(wallet => wallet.walletType === currency);
  };
  
  const getWalletAddress = (currency: string): string => {
    const wallet = connectedWallets.find(wallet => wallet.walletType === currency);
    return wallet ? wallet.address : '';
  };
  
  const handleCurrencySelect = (currency: string) => {
    console.log(`Currency selected: ${currency}`);
    setSelectedCurrency(currency);
    setErrorMessage('');
    
    // Also log whether this wallet is connected
    console.log(`Is wallet connected: ${isWalletConnected(currency)}`);
  };
  
  const connectWallet = async () => {
    if (!selectedCurrency) return;
    
    console.log(`Connecting wallet for: ${selectedCurrency}`);
    setIsConnecting(true);
    setErrorMessage('');
    
    try {
      // Find provider name for this currency
      const currencyData = currencies.find(c => c.symbol === selectedCurrency);
      if (!currencyData) {
        throw new Error(`Unknown currency: ${selectedCurrency}`);
      }
      
      console.log(`Using provider: ${currencyData.provider}`);
      
      // Connect the wallet
      const wallet = await cryptoPaymentProcessor.connectWallet(selectedCurrency, currencyData.provider);
      
      console.log('Wallet connection result:', wallet);
      
      if (wallet) {
        setConnectedWallets(prev => {
          // Replace if exists, otherwise add
          const existing = prev.findIndex(w => w.walletType === selectedCurrency);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = wallet;
            return updated;
          } else {
            return [...prev, wallet];
          }
        });
      } else {
        throw new Error(`Failed to connect ${selectedCurrency} wallet`);
      }
    } catch (error) {
      console.error(`Failed to connect ${selectedCurrency} wallet:`, error);
      
      // More descriptive error messages
      if (error instanceof Error) {
        if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
          setErrorMessage(`Connection to ${selectedCurrency} wallet service failed. Please check your internet connection and make sure your browser allows third-party cookies.`);
        } else if (error.message.includes('not installed')) {
          setErrorMessage(`${selectedCurrency} wallet extension is not installed. Please install the appropriate wallet extension for ${selectedCurrency}.`);
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setErrorMessage(`Failed to connect ${selectedCurrency} wallet. Make sure you have the appropriate wallet extension installed.`);
      }
    } finally {
      setIsConnecting(false);
    }
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
      
      if (error instanceof Error) {
        if (error.message.includes('API error') || error.message.includes('Failed to fetch')) {
          setErrorMessage('Payment service is temporarily unavailable. Please try again later.');
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setErrorMessage('Failed to process donation. Please try again later.');
      }
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
  
  const handleCloseNotification = () => {
    setErrorNotification('');
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
      <Snackbar 
        open={!!errorNotification} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        message={errorNotification}
      />
      
      <Alert severity="warning" sx={{ mb: 2 }}>
        <AlertTitle>Important</AlertTitle>
        Your donation will be processed through the CryptoProcessing payment gateway. 
        You must have the appropriate wallet extension installed (MetaMask for ETH/USDT, 
        Phantom for SOL, etc.) to complete your donation.
      </Alert>
      
      <Typography variant="h6" gutterBottom>
        Support This Campaign
      </Typography>
      
      {isConnecting && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>Connecting Wallet</AlertTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography>Please approve the connection request in your wallet extension...</Typography>
          </Box>
        </Alert>
      )}
      
      {connectedWallets.length > 0 && (
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
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: selectedCurrency === crypto.symbol 
                      ? 'primary.light' 
                      : 'background.paper',
                    color: selectedCurrency === crypto.symbol 
                      ? 'primary.contrastText' 
                      : 'text.primary',
                    borderColor: selectedCurrency === crypto.symbol ? 'primary.main' : 'divider',
                    '&:hover': {
                      backgroundColor: selectedCurrency === crypto.symbol ? 'primary.light' : 'action.hover',
                      transform: 'translateY(-2px)',
                      boxShadow: 1,
                    },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative'
                  }}
                  onClick={() => handleCurrencySelect(crypto.symbol)}
                >
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                    {crypto.symbol}
                  </Typography>
                  <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' } }}>
                    {crypto.name}
                  </Typography>
                  
                  {isConnected && (
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 2, 
                      right: 2, 
                      width: 10, 
                      height: 10, 
                      borderRadius: '50%',
                      bgcolor: 'success.main'
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
      
      {selectedCurrency && !isWalletConnected(selectedCurrency) ? (
        <>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              You need to connect your {selectedCurrency} wallet to continue.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={connectWallet}
            startIcon={isConnecting ? <CircularProgress size={20} color="inherit" /> : <AccountBalanceWalletIcon />}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : `Connect ${selectedCurrency} Wallet`}
          </Button>
        </>
      ) : (
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
      )}
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="body2" color="text.secondary">
        Your donation will be processed securely through the blockchain. Transaction fees may apply depending on network conditions.
      </Typography>
    </Paper>
  );
} 
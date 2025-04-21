'use client';

import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Menu, 
  MenuItem, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Typography, 
  Box, 
  Chip,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { Grid } from './GridFix';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { cryptoPaymentProcessor, type WalletConnection } from '../lib/paymentProcessor';

export default function WalletConnectButton() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [connectedWallets, setConnectedWallets] = useState<WalletConnection[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Supported cryptocurrencies and their wallet providers
  const walletProviders = [
    { currency: 'ETH', name: 'Ethereum', provider: 'MetaMask' },
    { currency: 'BTC', name: 'Bitcoin', provider: 'CryptoProcessing' },
    { currency: 'USDT', name: 'Tether', provider: 'MetaMask' },
    { currency: 'SOL', name: 'Solana', provider: 'Phantom' },
    { currency: 'DOT', name: 'Polkadot', provider: 'PolkadotJS' },
    { currency: 'ADA', name: 'Cardano', provider: 'Nami' }
  ];

  // Load connected wallets on mount
  useEffect(() => {
    const wallets = cryptoPaymentProcessor.getConnectedWallets();
    setConnectedWallets(wallets);
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
    handleClose();
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setError(null);
    setConnectingWallet(null);
  };

  const handleConnectWallet = async (currency: string, provider: string) => {
    try {
      setConnectingWallet(currency);
      setError(null);
      
      const wallet = await cryptoPaymentProcessor.connectWallet(currency, provider);
      
      if (wallet) {
        // Update connected wallets list
        const wallets = cryptoPaymentProcessor.getConnectedWallets();
        setConnectedWallets(wallets);
      }
      
      // Close dialog after successful connection
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect wallet');
    } finally {
      setConnectingWallet(null);
    }
  };

  const handleDisconnectWallet = async (currency: string) => {
    try {
      await cryptoPaymentProcessor.disconnectWallet(currency);
      
      // Update connected wallets list
      const wallets = cryptoPaymentProcessor.getConnectedWallets();
      setConnectedWallets(wallets);
      
      handleClose();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<AccountBalanceWalletIcon />}
        onClick={handleClick}
        aria-controls="wallet-menu"
        aria-haspopup="true"
      >
        {connectedWallets.length > 0 ? `${connectedWallets.length} Wallet${connectedWallets.length > 1 ? 's' : ''}` : 'Connect Wallet'}
      </Button>
      
      <Menu
        id="wallet-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {connectedWallets.length > 0 ? (
          <>
            {connectedWallets.map((wallet) => (
              <MenuItem key={wallet.walletType}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <Typography>{wallet.walletType} ({wallet.provider})</Typography>
                  <Chip 
                    label="Disconnect" 
                    color="error" 
                    size="small" 
                    onClick={() => handleDisconnectWallet(wallet.walletType)}
                  />
                </Box>
              </MenuItem>
            ))}
            <MenuItem divider />
          </>
        ) : null}
        
        <MenuItem onClick={handleOpenDialog}>
          <Typography color="primary">Connect New Wallet</Typography>
        </MenuItem>
      </Menu>
      
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Connect Wallet</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Typography gutterBottom>
            Select a cryptocurrency wallet to connect:
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {walletProviders.map((item) => {
              const isConnected = connectedWallets.some(w => w.walletType === item.currency);
              const isConnecting = connectingWallet === item.currency;
              
              return (
                <Grid item xs={6} sm={4} key={item.currency}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      cursor: isConnected ? 'default' : 'pointer',
                      backgroundColor: isConnected ? 'action.selected' : 'background.paper',
                      borderColor: isConnected ? 'primary.main' : 'divider',
                      '&:hover': {
                        borderColor: isConnected ? 'primary.main' : 'primary.light',
                        backgroundColor: isConnected ? 'action.selected' : 'action.hover',
                      },
                      position: 'relative',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    onClick={() => !isConnected && !isConnecting && handleConnectWallet(item.currency, item.provider)}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      {item.currency}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      via {item.provider}
                    </Typography>
                    
                    {isConnected && (
                      <Chip 
                        label="Connected" 
                        color="success" 
                        size="small" 
                        sx={{ mt: 1 }}
                      />
                    )}
                    
                    {isConnecting && (
                      <CircularProgress 
                        size={24} 
                        sx={{ 
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          marginTop: '-12px',
                          marginLeft: '-12px'
                        }} 
                      />
                    )}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 
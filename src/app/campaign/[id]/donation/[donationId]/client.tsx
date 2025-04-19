'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Chip,
  Link,
  Container,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { checkPaymentStatus } from '@/lib/cryptoprocessing';
import NextLink from 'next/link';

interface DonationStatusProps {
  params: { id: string; donationId: string };
}

export default function DonationStatusClient({ params }: DonationStatusProps) {
  const { id: campaignId, donationId } = params;
  const [donation, setDonation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed'>('pending');
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Fetch donation status
  const fetchDonationStatus = async () => {
    try {
      const response = await fetch(`/api/donations/${donationId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch donation status');
      }
      
      const data = await response.json();
      setDonation(data);
      
      // If the donation has a payment ID, check payment status via CryptoProcessing
      if (data.paymentId) {
        const status = await checkPaymentStatus(data.paymentId);
        setPaymentStatus(status.status);
        
        // If payment is complete or failed, stop polling
        if (status.status !== 'pending') {
          if (refreshInterval) {
            clearInterval(refreshInterval);
            setRefreshInterval(null);
          }
          
          // Update the backend with the new status
          await fetch(`/api/donations/${donationId}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: status.status,
              txHash: status.txHash,
            }),
          });
          
          // Refresh donation data
          const updatedResponse = await fetch(`/api/donations/${donationId}`);
          if (updatedResponse.ok) {
            const updatedData = await updatedResponse.json();
            setDonation(updatedData);
          }
        }
      } else {
        // If no payment ID yet, keep checking for incoming payment
        setPaymentStatus('pending');
      }
    } catch (error) {
      console.error('Error fetching donation status:', error);
      setError('Failed to fetch donation status');
    } finally {
      setLoading(false);
    }
  };
  
  // Polling for status updates
  useEffect(() => {
    // Initial fetch
    fetchDonationStatus();
    
    // Set up polling every 15 seconds
    const interval = setInterval(fetchDonationStatus, 15000);
    setRefreshInterval(interval);
    
    // Clean up on unmount
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [campaignId, donationId]);
  
  // Determine status display
  const getStatusDisplay = () => {
    if (!donation) return null;
    
    if (donation.status === 'completed' || paymentStatus === 'completed') {
      return (
        <Alert severity="success" sx={{ mb: 3 }}>
          Your donation has been successfully processed! Thank you for your support.
        </Alert>
      );
    } else if (donation.status === 'failed' || paymentStatus === 'failed') {
      return (
        <Alert severity="error" sx={{ mb: 3 }}>
          Your donation could not be processed. Please try again or contact support.
        </Alert>
      );
    } else {
      return (
        <Alert severity="info" sx={{ mb: 3 }}>
          Please send {donation.amount} {donation.currency} to the payment address. We'll process your donation once payment is received.
        </Alert>
      );
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Button
        component={NextLink}
        href={`/campaign/${campaignId}`}
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
      >
        Back to Campaign
      </Button>
      
      <Typography variant="h4" gutterBottom>
        Donation Status
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : donation ? (
        <>
          {getStatusDisplay()}
          
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Donation Details
              </Typography>
              <Chip 
                label={donation.status.toUpperCase()}
                color={
                  donation.status === 'completed' ? 'success' :
                  donation.status === 'failed' ? 'error' : 'default'
                }
              />
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Amount:
              </Typography>
              <Typography variant="body1">
                {donation.amount} {donation.currency}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                USD Equivalent:
              </Typography>
              <Typography variant="body1">
                ${donation.usdEquivalent}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Date:
              </Typography>
              <Typography variant="body1">
                {new Date(donation.createdAt).toLocaleString()}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Payment Status:
              </Typography>
              <Typography variant="body1">
                <Chip
                  label={paymentStatus.toUpperCase()}
                  size="small"
                  color={
                    paymentStatus === 'completed' ? 'success' :
                    paymentStatus === 'failed' ? 'error' : 'primary'
                  }
                  variant={paymentStatus === 'pending' ? 'outlined' : 'filled'}
                />
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Payment Address:
              </Typography>
              <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                {donation.paymentAddress}
              </Typography>
              
              {donation.transactionHash && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    Transaction:
                  </Typography>
                  <Typography variant="body1">
                    <Link
                      href={getExplorerUrl(donation.currency, donation.transactionHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {shortenTxHash(donation.transactionHash)}
                    </Link>
                  </Typography>
                </>
              )}
            </Box>
            
            {paymentStatus === 'pending' && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <CircularProgress size={30} sx={{ mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Waiting for payment. Send {donation.amount} {donation.currency} to the address above.
                </Typography>
              </Box>
            )}
          </Paper>
        </>
      ) : (
        <Alert severity="error">
          Donation not found
        </Alert>
      )}
    </Container>
  );
}

// Helper function to get the right blockchain explorer URL
function getExplorerUrl(currency: string, txHash: string): string {
  const explorers: Record<string, string> = {
    'BTC': `https://blockstream.info/tx/${txHash}`,
    'ETH': `https://etherscan.io/tx/${txHash}`,
    'SOL': `https://explorer.solana.com/tx/${txHash}`,
    'DOT': `https://polkascan.io/polkadot/transaction/${txHash}`,
    'ADA': `https://cardanoscan.io/transaction/${txHash}`,
    'USDT': `https://etherscan.io/tx/${txHash}`, // Default to Ethereum for USDT
  };

  return explorers[currency] || `https://etherscan.io/tx/${txHash}`;
}

// Helper function to shorten transaction hash
function shortenTxHash(txHash: string): string {
  if (!txHash || txHash.length < 16) return txHash;
  return `${txHash.substring(0, 8)}...${txHash.substring(txHash.length - 8)}`;
} 
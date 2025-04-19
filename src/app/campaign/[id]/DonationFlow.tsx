'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  CircularProgress,
  Alert,
  Divider,
  TextField,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import CurrencySelector from '@/app/components/CurrencySelector';
import { SUPPORTED_CURRENCIES, createPaymentAddress } from '@/lib/cryptoprocessing/index';
import { useRouter } from 'next/navigation';

interface DonationFlowProps {
  campaignId: string;
  campaignTitle: string;
  targetCurrency: string;
}

export default function DonationFlow({ campaignId, campaignTitle, targetCurrency }: DonationFlowProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState('SOL');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentAddress, setPaymentAddress] = useState<string | null>(null);
  const [donationId, setDonationId] = useState<string | null>(null);
  const [usdValue, setUsdValue] = useState<number>(0);
  
  const steps = ['Select Currency', 'Enter Details', 'Confirm Donation'];
  
  // Handle currency and amount change
  const handleCurrencyChange = (currency: string, newAmount: string) => {
    setSelectedCurrency(currency);
    setAmount(newAmount);
    
    // Calculate estimated USD value
    const numericAmount = parseFloat(newAmount || '0');
    const estimatedPrice = getEstimatedPrice(currency);
    setUsdValue(numericAmount * estimatedPrice);
  };
  
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };
  
  const handleAnonymousChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsAnonymous(e.target.checked);
  };
  
  // Simple placeholder function to get estimated prices
  const getEstimatedPrice = (currency: string): number => {
    const prices: Record<string, number> = {
      'ETH': 3500,
      'BTC': 65000,
      'USDT': 1,
      'SOL': 140,
      'DOT': 8,
      'ADA': 0.5
    };
    return prices[currency] || 0;
  };
  
  // Handle next step
  const handleNext = async () => {
    // Validate current step
    if (activeStep === 0 && (!selectedCurrency || !amount || parseFloat(amount) <= 0)) {
      setError('Please select a currency and enter a valid amount');
      return;
    }
    
    setError(null);
    
    // If this is the final step, process the donation
    if (activeStep === steps.length - 1) {
      await processDonation();
      return;
    }
    
    // Before moving to final step, generate payment address if needed
    if (activeStep === steps.length - 2) {
      try {
        await generatePaymentAddress();
      } catch (err) {
        setError('Failed to generate payment address. Please try again.');
        return;
      }
    }
    
    // Move to the next step
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  // Generate a payment address using CryptoProcessing API
  const generatePaymentAddress = async () => {
    if (!session?.user?.id) {
      setError('You must be signed in to donate');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create callback URL for payment notifications
      const callbackUrl = `${window.location.origin}/api/donations/callback`;
      
      // Generate payment address from CryptoProcessing API
      const address = await createPaymentAddress(
        selectedCurrency,
        callbackUrl,
        {
          campaignId,
          userId: session.user.id
        }
      );
      
      // Save the generated address
      setPaymentAddress(address);
      
      // Create donation record in our database
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId,
          amount,
          currency: selectedCurrency,
          message,
          isAnonymous,
          paymentAddress: address,
          usdEquivalent: usdValue,
          targetCurrency
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to record donation');
      }
      
      const data = await response.json();
      setDonationId(data.id);
      
    } catch (error) {
      console.error('Error generating payment address:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate payment address');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Handle back button
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Process the donation
  const processDonation = async () => {
    if (!donationId || !paymentAddress) {
      setError('Payment information missing. Please try again.');
      return;
    }
    
    // Redirect to the donation status page
    router.push(`/campaign/${campaignId}/donation/${donationId}`);
  };
  
  // Render current step
  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Donation Currency and Amount
            </Typography>
            <CurrencySelector
              initialValue={selectedCurrency}
              onChange={handleCurrencyChange}
            />
            <Typography variant="body2" sx={{ mt: 2 }}>
              Campaign will receive funds in {targetCurrency}
            </Typography>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Donation Details
            </Typography>
            <TextField
              fullWidth
              label="Message (Optional)"
              placeholder="Add a message of support"
              multiline
              rows={3}
              value={message}
              onChange={handleMessageChange}
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Checkbox 
                  checked={isAnonymous}
                  onChange={handleAnonymousChange}
                />
              }
              label="Make this donation anonymous"
            />
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Payment Instructions
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Send {amount} {selectedCurrency} to the address below to complete your donation.
            </Alert>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="body1" fontWeight="bold">
                Payment Amount:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {amount} {selectedCurrency} (≈ ${usdValue.toFixed(2)} USD)
              </Typography>
              
              <Typography variant="body1" fontWeight="bold">
                Send To This Address:
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  wordBreak: 'break-all', 
                  p: 1, 
                  bgcolor: 'background.default', 
                  borderRadius: 1,
                  mb: 2
                }}
              >
                {paymentAddress}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Once we receive your payment, your donation will be processed and automatically converted to {targetCurrency}.
              </Typography>
            </Paper>
            <Typography variant="body2" color="text.secondary">
              Note: CryptoProcessing handles the currency conversion with competitive exchange rates.
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };
  
  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', px: 2 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        {renderStep()}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0 || loading}
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : activeStep === steps.length - 1 ? (
              'I Have Made The Payment'
            ) : (
              'Next'
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
} 
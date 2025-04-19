'use client';

import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Avatar, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import { Donation } from '../lib/types';

interface DonorLeaderboardProps {
  donations: Donation[];
  title?: string;
}

export default function DonorLeaderboard({ donations, title = "Top Donors" }: DonorLeaderboardProps) {
  // Format currency amount with appropriate precision
  const formatCryptoAmount = (amount: number, currency: string): string => {
    if (currency === 'BTC') {
      return amount.toFixed(6); // Bitcoin often uses 6 decimal places
    } else if (currency === 'ETH' || currency === 'SOL') {
      return amount.toFixed(4); // Ethereum and Solana often use 4 decimal places
    } else if (currency === 'USDT') {
      return amount.toFixed(2); // Stablecoins like USDT often use 2 decimal places
    } else {
      return amount.toString(); // Default formatting
    }
  };

  // Format USD amount
  const formatUSD = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      
      {donations.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
          This campaign has no donations yet. Be the first to contribute!
        </Typography>
      ) : (
        <List disablePadding>
          {donations.map((donation, index) => (
            <React.Fragment key={donation.id}>
              {index > 0 && <Divider variant="inset" component="li" />}
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar 
                    src={donation.donor.avatar} 
                    alt={donation.donor.name}
                    sx={{ 
                      border: '2px solid',
                      borderColor: index === 0 ? 'gold' : 
                                  index === 1 ? 'silver' : 
                                  index === 2 ? '#cd7f32' : 'transparent'
                    }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography component="span" variant="subtitle2">
                        {donation.donor.name}
                      </Typography>
                      <Chip 
                        label={`#${index + 1}`} 
                        size="small" 
                        color={index === 0 ? 'primary' : 'default'}
                        sx={{ height: 20 }}
                      />
                    </Box>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {formatCryptoAmount(donation.amount, donation.currency)} {donation.currency}
                      </Typography>
                      {" — "}
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                      >
                        {formatUSD(donation.usdAmount)}
                      </Typography>
                    </React.Fragment>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Currency rates updated daily
        </Typography>
      </Box>
    </Paper>
  );
} 
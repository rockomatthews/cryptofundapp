'use client';

import React from 'react';
import { Box, Container, Typography, Link, Divider, Grid } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              CryptoFund
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A decentralized crowdfunding platform powered by cryptocurrency
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              Platform
            </Typography>
            <Link href="/" color="inherit" display="block" sx={{ mb: 1 }}>
              Home
            </Link>
            <Link href="/explore" color="inherit" display="block" sx={{ mb: 1 }}>
              Explore
            </Link>
            <Link href="/create" color="inherit" display="block" sx={{ mb: 1 }}>
              Create Campaign
            </Link>
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              Resources
            </Typography>
            <Link href="/faq" color="inherit" display="block" sx={{ mb: 1 }}>
              FAQ
            </Link>
            <Link href="/docs" color="inherit" display="block" sx={{ mb: 1 }}>
              Documentation
            </Link>
            <Link href="/terms" color="inherit" display="block" sx={{ mb: 1 }}>
              Terms of Service
            </Link>
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              Connect
            </Typography>
            <Link href="https://twitter.com" target="_blank" rel="noopener" color="inherit" display="block" sx={{ mb: 1 }}>
              Twitter
            </Link>
            <Link href="https://discord.com" target="_blank" rel="noopener" color="inherit" display="block" sx={{ mb: 1 }}>
              Discord
            </Link>
            <Link href="https://github.com" target="_blank" rel="noopener" color="inherit" display="block" sx={{ mb: 1 }}>
              GitHub
            </Link>
          </Grid>
        </Grid>
        <Divider sx={{ my: 4 }} />
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          {new Date().getFullYear()}{' '}
          CryptoFund. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 
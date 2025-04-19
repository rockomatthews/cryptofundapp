'use client';

import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert
} from '@mui/material';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SecurityIcon from '@mui/icons-material/Security';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

export default function PlatformRules() {
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
            Platform Rules & Guidelines
          </Typography>
          
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Our platform is designed specifically for blockchain and cryptocurrency projects.
            These guidelines ensure transparency and trust for both creators and backers.
          </Typography>
          
          <Paper sx={{ p: 4, mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
              All-or-Nothing Funding Model
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              We use an all-or-nothing funding model similar to Kickstarter. Projects must reach their funding goal to receive any money.
            </Alert>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleOutlineIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="If a project reaches or exceeds its funding goal by the deadline, all funds are released to the creator (minus platform fees)."
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <PriorityHighIcon color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary="If a project does not reach its funding goal by the deadline, all contributions are automatically returned to the backers via smart contract."
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="All funds are securely held in escrow by our smart contracts until the campaign deadline."
                  secondary="This ensures that backers' funds are protected and only released under the proper conditions."
                />
              </ListItem>
            </List>
          </Paper>
          
          <Paper sx={{ p: 4, mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
              Cryptocurrency Usage Requirement
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Projects must use the cryptocurrency they&apos;re raising in their actual operations.
            </Alert>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleOutlineIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Projects must explain how the cryptocurrency they&apos;re raising will be used in their operations."
                  secondary="This could include using it as a native token, for transaction processing, as a utility token, etc."
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <PriorityHighIcon color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary="Campaigns that don&apos;t demonstrate legitimate cryptocurrency usage may be rejected or removed."
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <AccountBalanceWalletIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Creators must provide a detailed explanation in the 'Cryptocurrency Usage' section during campaign creation."
                />
              </ListItem>
            </List>
          </Paper>
          
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
              Platform Fees
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Our platform charges a 5% fee on successfully funded projects only.
            </Alert>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <MonetizationOnIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="5% platform fee is applied only to projects that successfully meet their funding goal."
                  secondary="If a project doesn&apos;t reach its goal, no fees are charged and all funds are returned to backers."
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CheckCircleOutlineIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="The fee is automatically calculated and deducted when funds are released to project creators."
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="All transactions, including fee calculations, are transparently processed through our smart contracts and visible on the blockchain."
                />
              </ListItem>
            </List>
          </Paper>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
} 
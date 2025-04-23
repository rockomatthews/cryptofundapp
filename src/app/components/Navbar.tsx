'use client';

import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem, 
  Container, 
  Box, 
  useMediaQuery,
  useTheme
} from '@mui/material';
import Link from 'next/link';
import MenuIcon from '@mui/icons-material/Menu';
import { useSession } from 'next-auth/react';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { data: session, status } = useSession();
  
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const isAuthenticated = status === 'authenticated' && !!session;

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            CryptoFund
          </Typography>

          {isMobile ? (
            <>
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMenu}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose} component={Link} href="/">Home</MenuItem>
                <MenuItem onClick={handleClose} component={Link} href="/explore">Explore</MenuItem>
                <MenuItem onClick={handleClose} component={Link} href="/create">Create Campaign</MenuItem>
                {!isAuthenticated && (
                  <MenuItem onClick={handleClose} component={Link} href="/auth/signin">
                    Log In
                  </MenuItem>
                )}
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button color="inherit" component={Link} href="/">
                Home
              </Button>
              <Button color="inherit" component={Link} href="/explore">
                Explore
              </Button>
              <Button color="inherit" component={Link} href="/create">
                Create Campaign
              </Button>
              {!isAuthenticated && (
                <Button 
                  variant="contained" 
                  color="primary" 
                  component={Link} 
                  href="/auth/signin"
                >
                  Log In
                </Button>
              )}
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 
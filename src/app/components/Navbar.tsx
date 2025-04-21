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
  Avatar, 
  Divider, 
  useMediaQuery,
  useTheme
} from '@mui/material';
import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import WalletConnectButton from './WalletConnectButton';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [userMenuAnchor, setUserMenuAnchor] = React.useState<null | HTMLElement>(null);
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };
  
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
    handleUserMenuClose();
  };
  
  const handleSignIn = () => {
    signIn(undefined, { callbackUrl: '/' });
  };

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
                <MenuItem onClick={handleClose} component={Link} href="/profile">My Profile</MenuItem>
                <Divider />
                <MenuItem>
                  <WalletConnectButton />
                </MenuItem>
                <Divider />
                {isAuthenticated ? (
                  [
                    <MenuItem key="profile" onClick={handleClose} component={Link} href="/profile">
                      Profile
                    </MenuItem>,
                    <MenuItem key="dashboard" onClick={handleClose} component={Link} href="/profile/edit">
                      Edit Profile
                    </MenuItem>,
                    <Divider key="divider" />,
                    <MenuItem key="signout" onClick={handleSignOut}>
                      Sign Out
                    </MenuItem>
                  ]
                ) : (
                  <MenuItem onClick={handleSignIn}>
                    Sign In
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
              <Button color="inherit" component={Link} href="/profile">
                My Profile
              </Button>
              
              <WalletConnectButton />
              
              {isAuthenticated ? (
                <>
                  <IconButton
                    onClick={handleUserMenu}
                    size="small"
                    sx={{ ml: 2 }}
                    aria-controls="user-menu"
                    aria-haspopup="true"
                  >
                    {session?.user?.image ? (
                      <Avatar 
                        src={session.user.image} 
                        alt={session.user.name || 'user'} 
                        sx={{ width: 32, height: 32 }}
                      />
                    ) : (
                      <AccountCircleIcon />
                    )}
                  </IconButton>
                  <Menu
                    id="user-menu"
                    anchorEl={userMenuAnchor}
                    keepMounted
                    open={Boolean(userMenuAnchor)}
                    onClose={handleUserMenuClose}
                  >
                    <MenuItem component={Link} href="/profile" onClick={handleUserMenuClose}>
                      Profile
                    </MenuItem>
                    <MenuItem component={Link} href="/profile/edit" onClick={handleUserMenuClose}>
                      Edit Profile
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
                  </Menu>
                </>
              ) : (
                <Button 
                  variant="outlined" 
                  color="primary"
                  component={Link}
                  href="/auth/signin"
                >
                  Sign In
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
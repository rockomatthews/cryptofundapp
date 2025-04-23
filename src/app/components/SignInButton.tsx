import React, { useState } from 'react';
import { Button, ButtonProps, SvgIcon, CircularProgress } from '@mui/material';
import { ClientSafeProvider, signIn } from 'next-auth/react';

interface ProviderIconProps {
  providerId: string;
}

// Provider icons
const ProviderIcon = ({ providerId }: ProviderIconProps) => {
  switch (providerId.toLowerCase()) {
    case 'google':
      return (
        <SvgIcon viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
          />
        </SvgIcon>
      );
    case 'apple':
      return (
        <SvgIcon viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M17.05,13.844c-0.042,3.16,2.48,4.221,2.52,4.239c-0.021,0.07-0.392,1.391-1.297,2.76c-0.781,1.174-1.592,2.346-2.871,2.371c-1.257,0.025-1.659-0.764-3.092-0.764c-1.435,0-1.881,0.74-3.07,0.789c-1.231,0.047-2.168-1.273-2.954-2.443c-1.606-2.377-2.835-6.73-1.188-9.669c0.824-1.467,2.283-2.396,3.873-2.421c1.207-0.022,2.35,0.831,3.088,0.831c0.742,0,2.132-1.028,3.597-0.877c0.611,0.026,2.33,0.255,3.432,1.918c-0.089,0.057-2.045,1.223-2.027,3.646C17.06,13.752,17.055,13.794,17.05,13.844z M14.306,4.462c0.652-0.818,1.089-1.949,0.969-3.082C14.194,1.453,13.217,0.65,12.122,0.05c-0.672,0.87-1.175,1.935-1.088,3.046C12.188,4.165,13.275,4.96,14.306,4.462z"
          />
        </SvgIcon>
      );
    default:
      return null;
  }
};

interface SignInButtonProps extends ButtonProps {
  provider: ClientSafeProvider;
}

export default function SignInButton({ provider, ...props }: SignInButtonProps) {
  const { id, name } = provider;
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      console.log(`Attempting to sign in with ${id} provider`);
      
      // Get the current URL to determine the callback
      const origin = window.location.origin;
      const callbackUrl = new URL('/dashboard', origin).toString();
      
      await signIn(id, { 
        callbackUrl,
        redirect: true
      });
      
      // Note: The following code will only execute if redirect: false
      // When using redirect: true (default), the page will redirect before this point
      console.log(`Sign in with ${id} successful, redirecting...`);
    } catch (error) {
      console.error(`Error signing in with ${id}:`, error);
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      variant="outlined"
      onClick={handleSignIn}
      startIcon={!isLoading && <ProviderIcon providerId={id} />}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          Connecting...
        </>
      ) : (
        `Continue with ${name}`
      )}
    </Button>
  );
} 
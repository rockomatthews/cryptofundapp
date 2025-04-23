import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

/**
 * Custom hook to check authentication state properly
 * This fixes the issue where status is 'authenticated' but user is null
 */
export function useAuth() {
  const { data: session, status, update } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  
  // Store the real authenticated state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check both status and user object to determine real auth state
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      // If status is loading, wait for it to resolve
      if (status === 'loading') {
        return;
      }
      
      // Only consider authenticated if we have both authenticated status AND valid user data
      const authenticated = status === 'authenticated' && !!session?.user;
      setIsAuthenticated(authenticated);
      
      // If we have inconsistent state (authenticated but no user), try to refresh the session
      if (status === 'authenticated' && !session?.user) {
        console.warn('Inconsistent session state detected: authenticated with no user');
        try {
          // Try to update the session
          await update();
        } catch (error) {
          console.error('Failed to update session:', error);
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, [session, status, update]);
  
  return {
    session,
    status,
    isAuthenticated,
    isLoading,
    user: session?.user
  };
} 
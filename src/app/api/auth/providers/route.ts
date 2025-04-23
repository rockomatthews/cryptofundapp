import { NextResponse } from 'next/server';
import { getProviders } from 'next-auth/react';

// This endpoint returns the list of configured authentication providers
// It's used by the client to display provider buttons in the sign-in form
export async function GET() {
  try {
    const providers = await getProviders();
    
    // If providers is null, create a fallback Google provider
    // This ensures the UI always has something to display
    if (!providers) {
      console.warn('[api/auth/providers] getProviders() returned null, using fallback provider');
      
      // Create a fallback provider object
      const fallbackProviders = {
        google: {
          id: "google",
          name: "Google",
          type: "oauth",
          signinUrl: "/api/auth/signin/google",
          callbackUrl: "/api/auth/callback/google"
        }
      };
      
      return NextResponse.json(fallbackProviders, {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'Content-Type': 'application/json',
        },
      });
    }
    
    // Otherwise return the actual providers
    console.log('[api/auth/providers] Returning providers:', Object.keys(providers));
    return NextResponse.json(providers, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[api/auth/providers] Error fetching providers:', error);
    
    // Even on error, return a valid fallback provider rather than an error
    const fallbackProviders = {
      google: {
        id: "google",
        name: "Google",
        type: "oauth",
        signinUrl: "/api/auth/signin/google",
        callbackUrl: "/api/auth/callback/google"
      }
    };
    
    return NextResponse.json(fallbackProviders, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Content-Type': 'application/json',
      },
    });
  }
} 
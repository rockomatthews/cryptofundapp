import { NextResponse } from 'next/server';

export async function GET() {
  // Check if Google OAuth credentials are set
  const hasGoogleCredentials = !!(
    process.env.GOOGLE_CLIENT_ID && 
    process.env.GOOGLE_CLIENT_SECRET
  );

  // Determine the callback URL that would be used
  let callbackUrl = 'http://localhost:3000/api/auth/callback/google';
  
  if (process.env.NEXTAUTH_URL) {
    callbackUrl = `${process.env.NEXTAUTH_URL}/api/auth/callback/google`;
  } else if (process.env.VERCEL_URL) {
    callbackUrl = `https://${process.env.VERCEL_URL}/api/auth/callback/google`;
  } else if (process.env.NODE_ENV === 'production') {
    callbackUrl = 'https://www.cryptostarter.app/api/auth/callback/google';
  }

  // Return a simple JSON response with important debug info
  return NextResponse.json({
    googleCredentialsConfigured: hasGoogleCredentials,
    authSecretConfigured: !!process.env.NEXTAUTH_SECRET,
    callbackUrl,
    environment: process.env.NODE_ENV,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    vercelUrl: process.env.VERCEL_URL,
    message: hasGoogleCredentials 
      ? 'Google OAuth credentials are configured' 
      : 'Google OAuth credentials are missing',
    nextStep: 'Ensure this callback URL is configured in Google Cloud Console',
  });
} 
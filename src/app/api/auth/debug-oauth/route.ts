import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
  const googleCallbackUrl = new URL('/api/auth/callback/google', baseUrl).toString();
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    authConfig: {
      nextAuthUrl: process.env.NEXTAUTH_URL || null,
      vercelUrl: process.env.VERCEL_URL || null,
      effectiveBaseUrl: baseUrl,
      googleCallbackUrl,
      googleConfigured: {
        clientId: !!process.env.GOOGLE_CLIENT_ID,
        clientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        clientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
        clientSecretLength: process.env.GOOGLE_CLIENT_SECRET?.length || 0,
      },
      secretConfigured: !!process.env.NEXTAUTH_SECRET,
      secretLength: process.env.NEXTAUTH_SECRET?.length || 0,
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV || null,
    },
    routerInfo: {
      callbackPath: '/api/auth/callback/google',
      signinPath: '/api/auth/signin/google',
      sessionPath: '/api/auth/session',
    }
  });
} 
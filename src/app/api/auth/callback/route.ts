import { NextResponse } from 'next/server';

// This route handles the callback from OAuth providers
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    console.log("[auth/callback] Received callback with params:", 
      Object.fromEntries(searchParams.entries()));
    
    // The actual authentication handling will be managed by NextAuth
    // This route is mainly for logging and debugging
    
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  } catch (error) {
    console.error('[auth/callback] Error processing callback:', error);
    return NextResponse.json(
      { error: 'Failed to process authentication callback' },
      { status: 500 }
    );
  }
} 
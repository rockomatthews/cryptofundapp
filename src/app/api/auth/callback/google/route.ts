import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    console.log("[auth/callback/google] Received callback with code:", code ? "present" : "missing");
    console.log("[auth/callback/google] State parameter:", state ? state : "missing");
    
    if (!code) {
      console.error("[auth/callback/google] Missing code parameter");
      return NextResponse.redirect(new URL('/auth/error?error=OAuthCallbackError&message=Missing+code+parameter', request.url));
    }
    
    // NextAuth will handle the actual token exchange
    // This route is primarily for logging and debugging
    // The request will be processed by the [...nextauth] route handlers
    
    return NextResponse.next();
  } catch (error) {
    console.error('[auth/callback/google] Error processing callback:', error);
    
    return NextResponse.redirect(
      new URL('/auth/error?error=OAuthCallbackError&message=Failed+to+process+authentication', request.url)
    );
  }
} 
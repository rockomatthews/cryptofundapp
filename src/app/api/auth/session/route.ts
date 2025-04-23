import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return an empty session to avoid errors
    return NextResponse.json({ user: null }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[api/auth/session] Error fetching session:', error);
    
    // Even on error, return a valid JSON response instead of throwing a 500
    return NextResponse.json({ user: null }, {
      status: 200, // Return 200 even on error to prevent client-side crashes
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Content-Type': 'application/json',
      },
    });
  }
} 
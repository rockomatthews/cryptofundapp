import { NextResponse } from 'next/server';
import { getProviders } from 'next-auth/react';

// This endpoint returns the list of configured authentication providers
// It's used by the client to display provider buttons in the sign-in form
export async function GET() {
  try {
    const providers = await getProviders();
    return NextResponse.json(providers);
  } catch (error) {
    console.error('Error fetching providers:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch providers' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 
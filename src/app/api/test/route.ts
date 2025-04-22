import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'API endpoint reachable',
    timestamp: new Date().toISOString(),
    region: process.env.VERCEL_REGION || 'unknown'
  });
} 
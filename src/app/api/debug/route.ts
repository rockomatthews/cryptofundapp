import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    const testUser = await prisma.user.findFirst();
    
    // Check for critical environment variables
    const envVars = {
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set',
    };
    
    // Get database connection info
    const dbConnection = {
      connectionActive: !!testUser || false,
      userExists: !!testUser,
      userCount: await prisma.user.count()
    };
    
    return NextResponse.json({
      success: true,
      environment: process.env.NODE_ENV,
      envVars,
      dbConnection,
      timestamp: new Date().toISOString()
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Debug route error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 
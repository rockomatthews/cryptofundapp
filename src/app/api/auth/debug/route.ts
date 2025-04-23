import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";

// Define authOptions locally to match the NextAuth configuration
const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt' as const,
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * API route that provides debug information for authentication
 * Only returns presence of variables, not their actual values for security
 */
export async function GET() {
  // Get the current session
  const session = await getServerSession(authOptions);
  
  // Extract provider IDs from authOptions
  const providerIds = authOptions.providers?.map(p => p.id) || [];
  
  // Calculate effective URL
  const effectiveUrl = process.env.NEXTAUTH_URL || 
                      (process.env.NODE_ENV === 'production' ? 'https://www.cryptostarter.app' : 'http://localhost:3000');
  
  // Return sanitized environment info
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    session: {
      exists: !!session,
      user: session?.user ? {
        email: session.user.email,
        name: session.user.name,
        hasImage: !!session.user.image
      } : null
    },
    env: {
      // NextAuth configuration
      NEXTAUTH_URL_SET: !!process.env.NEXTAUTH_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
      NEXTAUTH_SECRET_SET: !!process.env.NEXTAUTH_SECRET,
      
      // Google OAuth settings - only show if they're set, not the actual values
      GOOGLE_CLIENT_ID_SET: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_ID_LENGTH: process.env.GOOGLE_CLIENT_ID?.length || 0,
      GOOGLE_CLIENT_SECRET_SET: !!process.env.GOOGLE_CLIENT_SECRET,
      GOOGLE_CLIENT_SECRET_LENGTH: process.env.GOOGLE_CLIENT_SECRET?.length || 0,
      
      // Other environment variables that might affect auth
      VERCEL_ENV: process.env.VERCEL_ENV || null,
      NODE_ENV: process.env.NODE_ENV || null,
      
      // NextAuth configuration from authOptions
      AUTH_PROVIDERS: providerIds,
      AUTH_HAS_GOOGLE: providerIds.includes('google'),
      AUTH_CALLBACK_URL: `/api/auth/callback/google`,
      AUTH_PAGES: authOptions.pages ? Object.keys(authOptions.pages) : [],
      
      // Computed values
      EFFECTIVE_URL: effectiveUrl,
      PRODUCTION_DOMAIN: 'https://www.cryptostarter.app'
    }
  });
} 
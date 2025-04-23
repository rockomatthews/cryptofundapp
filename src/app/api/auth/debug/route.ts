import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";

/**
 * API route that provides debug information for authentication
 * Only returns presence of variables, not their actual values for security
 */

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
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function GET() {
  // Get current session
  const session = await getServerSession(authOptions);
  
  // Return safe information about environment
  return NextResponse.json({
    authConfig: {
      providersConfigured: {
        google: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
      },
      nextAuthUrlConfigured: !!process.env.NEXTAUTH_URL,
      secretConfigured: !!process.env.NEXTAUTH_SECRET,
    },
    sessionStatus: {
      hasSession: !!session,
      authenticated: !!session?.user,
    },
    serverEnv: {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV || 'not set',
    }
  });
} 
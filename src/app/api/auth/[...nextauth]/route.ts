import NextAuth from 'next-auth/next';
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";

// Create the handler with enhanced logging
console.log('[NextAuth] Route handler initializing');
console.log('[NextAuth] Callback URL base:', process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000');
console.log('[NextAuth] Google credentials configured:', !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET);

// Print out relevant environment variables for debugging
if (process.env.NODE_ENV !== 'production') {
  console.log('[NextAuth] Environment variables:', {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    VERCEL_URL: process.env.VERCEL_URL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    NODE_ENV: process.env.NODE_ENV,
  });
}

function getBaseUrl() {
  // Make sure NEXTAUTH_URL is an absolute URL
  if (process.env.NEXTAUTH_URL) {
    console.log("[auth] Using NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
    return process.env.NEXTAUTH_URL;
  }
  // Make sure the server knows the full callback URL
  if (process.env.VERCEL_URL) {
    console.log("[auth] Using VERCEL_URL:", `https://${process.env.VERCEL_URL}`);
    return `https://${process.env.VERCEL_URL}`;
  }
  // If running on localhost
  console.log("[auth] Falling back to localhost:3000");
  return "http://localhost:3000";
}

const baseUrl = getBaseUrl();
console.log("[auth] Google OAuth configuration:");
console.log(`- Client ID exists: ${!!process.env.GOOGLE_CLIENT_ID}`);
console.log(`- Client Secret exists: ${!!process.env.GOOGLE_CLIENT_SECRET}`);
console.log(`- Callback URL will be: ${baseUrl}/api/auth/callback/google`);

// Local authOptions - not exported
const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV !== "production",
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Custom handler to wrap NextAuth and add custom headers
export async function GET(req: Request) {
  const response = await NextAuth(authOptions)(req);
  
  // Add cache control and other headers to improve HTTP/2 handling
  if (response && 'headers' in response) {
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('Pragma', 'no-cache');
  }
  
  return response;
}

export async function POST(req: Request) {
  const response = await NextAuth(authOptions)(req);
  
  // Add cache control and other headers to improve HTTP/2 handling
  if (response && 'headers' in response) {
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('Pragma', 'no-cache');
  }
  
  return response;
} 
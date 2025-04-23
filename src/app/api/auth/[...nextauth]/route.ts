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
  debug: true, // Enable debug mode for more detailed logs
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
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
      console.log('[NextAuth] Session callback:', { 
        sessionExists: !!session, 
        hasUser: !!session?.user,
        tokenExists: !!token,
        tokenSub: token?.sub
      });
      
      if (session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Log redirect information for debugging
      console.log('[NextAuth] Redirect called:', { url, baseUrl });
      
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        const redirectUrl = `${baseUrl}${url}`;
        console.log('[NextAuth] Redirecting to relative URL:', redirectUrl);
        return redirectUrl;
      }
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        console.log('[NextAuth] Redirecting to same origin URL:', url);
        return url;
      }
      
      console.log('[NextAuth] Redirecting to baseUrl:', baseUrl);
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  logger: {
    error(code, metadata) {
      console.error(`[NextAuth] Error: ${code}`, metadata);
    },
    warn(code) {
      console.warn(`[NextAuth] Warning: ${code}`);
    },
    debug(code, metadata) {
      console.log(`[NextAuth] Debug: ${code}`, metadata);
    }
  }
};

// Create and export the API route handler
const handler = NextAuth(authOptions);

// Custom GET handler to ensure proper headers
export async function GET(req) {
  try {
    console.log("[NextAuth] Processing GET request to:", req.url);
    const response = await handler(req);
    
    // Add cache control headers to prevent caching issues
    if (response && 'headers' in response) {
      response.headers.set('Cache-Control', 'no-store, max-age=0');
      response.headers.set('Pragma', 'no-cache');
    }
    
    return response;
  } catch (error) {
    console.error("[NextAuth] Error processing GET request:", error);
    // Return a more detailed error response
    return new Response(
      JSON.stringify({ 
        error: "Internal authentication error", 
        message: error.message || "Unknown error",
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0'
        }
      }
    );
  }
}

// Custom POST handler to ensure proper headers
export async function POST(req) {
  try {
    console.log("[NextAuth] Processing POST request to:", req.url);
    const response = await handler(req);
    
    // Add cache control headers to prevent caching issues
    if (response && 'headers' in response) {
      response.headers.set('Cache-Control', 'no-store, max-age=0');
      response.headers.set('Pragma', 'no-cache');
    }
    
    return response;
  } catch (error) {
    console.error("[NextAuth] Error processing POST request:", error);
    // Return a more detailed error response
    return new Response(
      JSON.stringify({ 
        error: "Internal authentication error", 
        message: error.message || "Unknown error",
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0'
        }
      }
    );
  }
} 
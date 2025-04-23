import NextAuth from 'next-auth/next';
import { authOptions } from "@/lib/auth";

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

// Create and export the API route handler using the centralized auth options
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
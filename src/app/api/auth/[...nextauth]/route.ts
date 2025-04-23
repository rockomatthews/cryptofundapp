import NextAuth from 'next-auth';
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

export const authOptions = {
  debug: process.env.NODE_ENV !== "production",
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
  callbacks: {
    async session({ session, token }) {
      console.log("[NextAuth] Session callback", { session, token });
      return session;
    },
    async jwt({ token, account }) {
      console.log("[NextAuth] JWT callback", { token, account });
      return token;
    }
  }
};

const handler = NextAuth(authOptions);

// Export handler functions for Next.js API routes
export { handler as GET, handler as POST }; 
// Extend the built-in session and JWT types
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";

declare module "next-auth" {
  interface Session {
    expires: string;  // ISO date string when session expires
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      walletAddress?: string | null;
      walletType?: string | null;
    }
  }
}

// Add JWT type extension
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    walletAddress?: string | null;
    walletType?: string | null;
  }
}

// Centralized auth options configuration
export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
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
    async jwt({ token, user }) {
      // When a user signs in, add their ID to the token
      if (user) {
        token.id = user.id;
        
        // Fetch user's wallet information if available
        const wallet = await prisma.wallet.findFirst({
          where: { userId: user.id }
        });
        
        if (wallet) {
          token.walletAddress = wallet.address;
          token.walletType = wallet.walletType;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Transfer data from token to session
      if (session?.user) {
        session.user.id = token.sub;
        
        // Add wallet information to session if available in token
        if (token.walletAddress) {
          session.user.walletAddress = token.walletAddress;
        }
        if (token.walletType) {
          session.user.walletType = token.walletType;
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== 'production',
};

// This file now only contains type definitions
// The actual auth configuration is in the route.ts file
// to avoid circular dependencies and simplify deployment 
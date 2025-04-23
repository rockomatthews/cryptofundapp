// Extend the built-in session and JWT types
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

// This file now only contains type definitions
// The actual auth configuration is in the route.ts file
// to avoid circular dependencies and simplify deployment 
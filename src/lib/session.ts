import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
import { Session } from "next-auth";

/**
 * Gets the server session with strong typing
 * 
 * @returns The current user session or null if not authenticated
 */
export async function getSession(): Promise<Session | null> {
  return getServerSession(authOptions);
}

/**
 * Gets the authenticated user or throws an error if not authenticated
 * 
 * @returns The current user from session
 * @throws Error if user is not authenticated
 */
export async function getAuthenticatedUser() {
  const session = await getSession();
  
  if (!session || !session.user || !session.user.id) {
    throw new Error("Not authenticated");
  }
  
  return session.user;
}

/**
 * Checks if a user is authenticated. Safer than try/catch with getAuthenticatedUser.
 * 
 * @returns True if the user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session?.user?.id;
} 
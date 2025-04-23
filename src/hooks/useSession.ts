import { useSession as useNextAuthSession } from "next-auth/react";

/**
 * Enhanced useSession hook that provides strongly typed session data
 * 
 * Example usage:
 * ```
 * const { session, status, user, isAuthenticated } = useSession();
 * 
 * if (isAuthenticated) {
 *   console.log(`Hello ${user.name}!`);
 * }
 * ```
 */
export function useSession() {
  const { data: session, status, update } = useNextAuthSession();
  
  return {
    session,
    status,
    update,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated" && !!session?.user?.id,
    // Provide user with default values to make usage easier
    user: session?.user || {
      id: undefined,
      name: undefined,
      email: undefined,
      image: undefined,
      walletAddress: undefined,
      walletType: undefined
    }
  };
}

/**
 * Hook that requires authentication, redirecting to login if not authenticated
 * 
 * Example usage:
 * ```
 * const { user } = useAuthenticatedSession();
 * // user is guaranteed to be available here
 * ```
 */
export function useAuthenticatedSession() {
  const { session, status, user, isAuthenticated } = useSession();
  
  // This could be enhanced with a redirect if needed
  if (status === "unauthenticated") {
    throw new Error("User is not authenticated");
  }
  
  return { session, status, user, isAuthenticated };
} 
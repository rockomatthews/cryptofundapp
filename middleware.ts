import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log("[Middleware] Processing request to:", request.url);

  // Create a response and modify headers to avoid caching issues
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Add cache control headers to all responses
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  response.headers.set('Pragma', 'no-cache');

  return response;
}

export const config = {
  /*
   * Match all request paths except for:
   * - static files (assets, images, etc.)
   * - API routes that don't need authentication middleware
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/|api/public/).*)'
  ],
}; 
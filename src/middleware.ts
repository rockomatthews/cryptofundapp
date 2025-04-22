import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Skip auth routes completely to avoid interference with NextAuth
  if (path.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Only apply CORS middleware to API routes
  if (path.startsWith('/api/')) {
    // Get the response
    const response = NextResponse.next();

    // Add CORS headers to API routes
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT,OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    // Handle preflight OPTIONS requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204 });
    }

    return response;
  }

  return NextResponse.next();
}

// Configure middleware to exclude auth routes
export const config = {
  matcher: [
    // Include all API routes except auth routes
    '/api/:path*',
    // Exclude auth routes explicitly
    '/((?!api/auth).*)',
  ],
}; 
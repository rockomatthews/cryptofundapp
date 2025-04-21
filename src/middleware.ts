import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

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

// Only match API routes and exclude auth api routes 
// (NextAuth has its own CORS handling)
export const config = {
  matcher: [
    {
      source: '/api/:path*',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}; 
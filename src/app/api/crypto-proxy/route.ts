import { NextResponse } from 'next/server';

// Get API key from environment variables
const API_KEY = process.env.CRYPTOPROCESSING_API_KEY || '';
const API_ENDPOINT = 'https://api.cryptoprocessing.io/api/v1';

// Define allowed endpoints for security
const ALLOWED_ENDPOINTS = [
  '/wallets/register',
  '/addresses/create',
  '/invoices/create',
  '/invoices'
];

export async function POST(request: Request) {
  try {
    // Check if API key is configured
    if (!API_KEY) {
      console.error('CRYPTOPROCESSING_API_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // Parse the request body
    const requestData = await request.json();
    const { endpoint, data } = requestData;

    // Validate the endpoint
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 }
      );
    }
    
    // Security check: Ensure the endpoint is in our allowed list or starts with an allowed prefix
    const isAllowed = ALLOWED_ENDPOINTS.some(allowed => 
      endpoint === allowed || 
      (endpoint.startsWith(allowed + '/') && allowed.includes('/invoices'))
    );
    
    if (!isAllowed) {
      console.warn(`Attempted access to unauthorized endpoint: ${endpoint}`);
      return NextResponse.json(
        { error: 'Unauthorized endpoint' },
        { status: 403 }
      );
    }

    // For endpoints that don't need authentication
    const isPublicEndpoint = endpoint.startsWith('/public/');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    // Add API key for authenticated endpoints
    if (!isPublicEndpoint) {
      headers['Authorization'] = `Bearer ${API_KEY}`;
    }
    
    // Make the request to the CryptoProcessing API
    const response = await fetch(`${API_ENDPOINT}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      return NextResponse.json(
        { 
          status: response.status,
          message: response.statusText,
          data: textResponse
        }, 
        { status: response.status }
      );
    }
    
    // Get the response data
    const responseData = await response.json();
    
    // Return the response from the CryptoProcessing API
    return NextResponse.json(responseData, { 
      status: response.status 
    });
  } catch (error) {
    console.error('Error in crypto-proxy:', error);
    
    // Determine if it's a fetch error or other type
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: 'Internal server error', message: errorMessage },
      { status: 500 }
    );
  }
} 
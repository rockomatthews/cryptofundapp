import { NextRequest, NextResponse } from 'next/server';
import { createPayment, PaymentRequest } from '@/app/lib/cryptoProcessing';
import { getServerSession } from 'next-auth/next';
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import prisma from '@/lib/prisma';

// Define authOptions locally to match the NextAuth configuration in [...]nextauth/route.ts
const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt' as const,
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['amount', 'currency', 'description', 'campaignId'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Create payment request
    const paymentRequest: PaymentRequest = {
      amount: body.amount,
      currency: body.currency,
      description: body.description,
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/payment/callback?campaignId=${body.campaignId}`,
      returnUrl: `${process.env.NEXTAUTH_URL}/campaign/${body.campaignId}/thank-you`,
      orderId: `campaign-${body.campaignId}-${Date.now()}`,
      email: session.user?.email || undefined,
    };
    
    // Create payment via CryptoProcessing API
    const payment = await createPayment(paymentRequest);
    
    return NextResponse.json(payment);
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}

// Payment callback handler
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get('payment_id');
    const campaignId = searchParams.get('campaignId');
    const status = searchParams.get('status');
    
    if (!paymentId || !campaignId || !status) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Here you would update your database with the payment status
    // This is just a placeholder - implement your database logic
    console.log(`Payment ${paymentId} for campaign ${campaignId} status: ${status}`);
    
    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.json(
      { error: 'Failed to process payment callback' },
      { status: 500 }
    );
  }
} 
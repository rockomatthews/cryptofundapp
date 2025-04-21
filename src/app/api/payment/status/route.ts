import { NextRequest, NextResponse } from 'next/server';
import { checkPaymentStatus } from '@/lib/cryptoprocessing';

export async function GET(req: NextRequest) {
  try {
    // Get payment ID from query params
    const url = new URL(req.url);
    const paymentId = url.searchParams.get('id');
    
    if (!paymentId) {
      return NextResponse.json(
        { error: 'Missing payment ID' },
        { status: 400 }
      );
    }
    
    // Check payment status
    const status = await checkPaymentStatus(paymentId);
    
    return NextResponse.json({
      status: status.status,
      amount: status.amount,
      currency: status.currency,
      txHash: status.txHash
    });
    
  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json(
      { error: 'Failed to check payment status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
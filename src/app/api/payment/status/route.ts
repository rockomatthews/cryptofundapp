import { NextRequest, NextResponse } from 'next/server';
import { checkPaymentStatus } from '@/lib/cryptoprocessing';
import prisma from '@/lib/prisma';

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
    
    // Check payment status from CryptoProcessing API
    const status = await checkPaymentStatus(paymentId);
    
    // Check if payment record exists in our database
    const paymentRecord = await prisma.paymentRecord.findUnique({
      where: { paymentId }
    });
    
    // Combine API status with our database record
    return NextResponse.json({
      status: status.status,
      amount: status.amount,
      currency: status.currency,
      txHash: status.txHash,
      destinationAddress: paymentRecord?.destinationAddress || null,
      recorded: !!paymentRecord
    });
    
  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json(
      { error: 'Failed to check payment status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
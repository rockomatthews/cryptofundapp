import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkPaymentStatus } from '@/lib/cryptoprocessing';
import { PLATFORM_FEE_PERCENTAGE } from '@/config/wallet';

export async function POST(req: NextRequest) {
  try {
    // Get the callback data from CryptoProcessing
    const data = await req.json();
    
    // Extract payment information
    const { payment_id, status, metadata } = data;
    
    if (!payment_id || !status || !metadata) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Parse metadata to get the userId and campaign information
    const parsedMetadata = typeof metadata === 'string' 
      ? JSON.parse(metadata) 
      : metadata;
    
    const { userId, campaignTitle, destinationWallet } = parsedMetadata;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid metadata: missing userId' },
        { status: 400 }
      );
    }
    
    // Verify payment status with CryptoProcessing API for security
    const paymentStatus = await checkPaymentStatus(payment_id);
    
    // Only proceed if payment is successful
    if (paymentStatus.status === 'completed') {
      // Record the payment in the database
      await prisma.paymentRecord.create({
        data: {
          paymentId: payment_id,
          amount: parseFloat(paymentStatus.amount),
          currency: paymentStatus.currency,
          status: 'completed',
          type: 'campaign_creation_fee',
          userId,
          destinationAddress: destinationWallet,
          transactionHash: paymentStatus.txHash || '',
          metadata: JSON.stringify({
            campaignTitle,
            platformFeePercentage: PLATFORM_FEE_PERCENTAGE
          })
        }
      });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Payment processed successfully',
        paymentId: payment_id,
        status: paymentStatus.status,
        destinationWallet
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Payment not completed',
        status: paymentStatus.status
      });
    }
    
  } catch (error) {
    console.error('Error processing payment callback:', error);
    return NextResponse.json(
      { error: 'Failed to process payment callback', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
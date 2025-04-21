import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkPaymentStatus } from '@/lib/cryptoprocessing';

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
    
    const { userId, campaignTitle } = parsedMetadata;
    
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
      // This is a simplified example - in a real app, you'd have a proper payments table
      await prisma.user.update({
        where: { id: userId },
        data: {
          // You would update user or add a record in a payments table
          // For now, we're just logging this
        }
      });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Payment processed successfully',
        paymentId: payment_id,
        status: paymentStatus.status
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
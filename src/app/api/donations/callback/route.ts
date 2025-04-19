import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { convertCurrency } from '@/lib/cryptoprocessing';

/**
 * CryptoProcessing callback endpoint
 * This handles incoming payment notifications when a donation is made
 */
export async function POST(req: NextRequest) {
  try {
    // Get the payment data from CryptoProcessing
    const data = await req.json();
    
    if (!data.payment_id || !data.status || !data.metadata) {
      return NextResponse.json(
        { error: 'Invalid callback data' },
        { status: 400 }
      );
    }
    
    // Parse the metadata (contains campaignId and userId)
    const metadata = typeof data.metadata === 'string' 
      ? JSON.parse(data.metadata) 
      : data.metadata;
    
    if (!metadata.campaignId || !metadata.userId) {
      return NextResponse.json(
        { error: 'Missing metadata information' },
        { status: 400 }
      );
    }
    
    // Find the donation by paymentAddress
    const donation = await prisma.donation.findFirst({
      where: {
        paymentAddress: data.address,
        campaignId: metadata.campaignId,
        userId: metadata.userId,
      },
      include: {
        campaign: true,
      },
    });
    
    if (!donation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      );
    }
    
    // Update donation with payment information
    await prisma.donation.update({
      where: {
        id: donation.id,
      },
      data: {
        paymentId: data.payment_id,
        status: mapPaymentStatus(data.status),
        transactionHash: data.transaction_hash || donation.transactionHash,
        updatedAt: new Date(),
      },
    });
    
    // If payment is successful and status is completed/confirmed, process currency conversion
    if (
      (data.status === 'completed' || data.status === 'confirmed') && 
      donation.campaign?.targetCurrency && 
      donation.campaign.targetCurrency !== donation.currency &&
      donation.campaign.creatorWalletAddress
    ) {
      try {
        // Convert the received currency to the campaign's target currency
        const conversionResult = await convertCurrency(
          donation.currency,
          donation.campaign.targetCurrency,
          donation.amount.toString(),
          donation.campaign.creatorWalletAddress
        );
        
        // Record the conversion in database
        await prisma.currencyConversion.create({
          data: {
            donationId: donation.id,
            campaignId: donation.campaignId,
            fromCurrency: donation.currency,
            toCurrency: donation.campaign.targetCurrency,
            fromAmount: donation.amount,
            exchangeId: conversionResult.exchangeId,
            status: 'processing',
            estimatedCompletionTime: new Date(conversionResult.estimatedCompletion),
          },
        });
      } catch (error) {
        console.error('Error converting currency:', error);
        // We still mark the donation as successful even if conversion fails
        // A background process can retry later
      }
    }
    
    return NextResponse.json({
      success: true,
      donationId: donation.id,
    });
  } catch (error) {
    console.error('Error processing callback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Map payment status from CryptoProcessing to our internal status
 */
function mapPaymentStatus(status: string): 'pending' | 'completed' | 'failed' {
  const statusMap: Record<string, 'pending' | 'completed' | 'failed'> = {
    'new': 'pending',
    'pending': 'pending',
    'processing': 'pending',
    'completed': 'completed',
    'confirmed': 'completed',
    'failed': 'failed',
    'canceled': 'failed',
    'error': 'failed'
  };
  
  return statusMap[status.toLowerCase()] || 'pending';
} 
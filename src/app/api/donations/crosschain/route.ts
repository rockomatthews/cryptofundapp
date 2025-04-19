import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { WormholeChainId } from '@/lib/wormhole/bridge';

export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const data = await req.json();
    
    // Validate required fields
    if (!data.campaignId || !data.amount || !data.currency || !data.sourceChain) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create a cross-chain donation record
    const donation = await prisma.donation.create({
      data: {
        amount: parseFloat(data.amount),
        currency: data.currency,
        status: 'pending',
        sourceChain: data.sourceChain,
        transferId: data.transferId || null,
        usdEquivalent: data.usdEquivalent || 0,
        userId: session.user.id,
        campaignId: data.campaignId,
        message: data.message || '',
        isAnonymous: data.isAnonymous || false,
        bridgeStatus: 'pending',
        transactionHash: data.transactionHash || null,
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      donationId: donation.id,
      message: 'Cross-chain donation initiated',
    });
  } catch (error) {
    console.error('Error creating cross-chain donation:', error);
    return NextResponse.json(
      { error: 'Failed to process donation' },
      { status: 500 }
    );
  }
}

// Webhook endpoint for bridge services to notify when a transfer is complete
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Validate required fields
    if (!data.transferId || !data.status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Find the donation by transferId
    const donation = await prisma.donation.findFirst({
      where: {
        transferId: data.transferId,
      },
    });
    
    if (!donation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      );
    }
    
    // Update the donation status
    await prisma.donation.update({
      where: {
        id: donation.id,
      },
      data: {
        bridgeStatus: data.status,
        status: data.status === 'completed' ? 'confirmed' : 'failed',
        transactionHash: data.transactionHash || donation.transactionHash,
        updatedAt: new Date(),
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Donation status updated',
    });
  } catch (error) {
    console.error('Error updating cross-chain donation:', error);
    return NextResponse.json(
      { error: 'Failed to update donation' },
      { status: 500 }
    );
  }
}

// Get the status of a cross-chain donation
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const donationId = url.searchParams.get('id');
    
    if (!donationId) {
      return NextResponse.json(
        { error: 'Donation ID is required' },
        { status: 400 }
      );
    }
    
    const donation = await prisma.donation.findUnique({
      where: {
        id: donationId,
      },
    });
    
    if (!donation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      id: donation.id,
      status: donation.status,
      bridgeStatus: donation.bridgeStatus,
      amount: donation.amount,
      currency: donation.currency,
      usdEquivalent: donation.usdEquivalent,
      createdAt: donation.createdAt,
      updatedAt: donation.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching donation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donation' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createWithdrawal } from '@/lib/cryptoprocessing/index';

// Define types for our functions
type DonationWithDetails = {
  id: string;
  amount: number;
  currency: string;
  userId: string;
  paymentAddress?: string;
  refunded?: boolean;
  status: string;
};

type CampaignWithRelations = {
  id: string;
  userId: string;
  goal: number;
  raised: number;
  endDate?: Date | string;
  isActive: boolean;
  user: Record<string, any>;
  donations: DonationWithDetails[];
};

/**
 * API route to finalize a campaign
 * This will determine if a campaign's goal was met and process payouts or refunds
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    
    // Check if campaign exists and has ended
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        user: true, // Get creator information
        donations: {
          where: { status: 'completed' } // Only consider completed donations
        }
      }
    });
    
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }
    
    // If campaign hasn't ended yet, don't finalize
    if (!campaign.endDate || new Date(campaign.endDate) > new Date()) {
      return NextResponse.json(
        { error: 'Campaign has not ended yet' },
        { status: 400 }
      );
    }
    
    // If campaign is already inactive, it's already been processed
    if (!campaign.isActive) {
      return NextResponse.json(
        { error: 'Campaign has already been finalized' },
        { status: 400 }
      );
    }

    // Calculate total amount raised
    const totalRaised = campaign.donations.reduce(
      (sum: number, donation: DonationWithDetails) => sum + donation.amount,
      0
    );
    
    // Check if campaign goal has been met
    const goalMet = totalRaised >= campaign.goal;
    
    // Update campaign status
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        isActive: false,
        raised: totalRaised,
      }
    });
    
    if (goalMet) {
      // Process campaign success - pay out to creator
      await handleCampaignSuccess(campaign as unknown as CampaignWithRelations, totalRaised);
      
      return NextResponse.json({
        success: true,
        status: 'success',
        message: 'Campaign successfully funded and payout initiated',
        totalRaised,
        goalMet
      });
    } else {
      // Process campaign failure - refund donors
      await handleCampaignFailure(campaign as unknown as CampaignWithRelations);
      
      return NextResponse.json({
        success: true,
        status: 'refunded',
        message: 'Campaign did not meet funding goal, refunds initiated',
        totalRaised,
        goalMet
      });
    }
    
  } catch (error) {
    console.error('Error finalizing campaign:', error);
    return NextResponse.json(
      { error: 'Failed to finalize campaign' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful campaign by paying out to the creator
 */
async function handleCampaignSuccess(campaign: CampaignWithRelations, totalAmount: number) {
  try {
    // Get creator wallet information - assuming they have a preferred wallet
    const creatorWallet = await prisma.wallet.findFirst({
      where: { userId: campaign.userId }
    });
    
    if (!creatorWallet) {
      throw new Error('Creator has no wallet to receive funds');
    }
    
    // Use CryptoProcessing to withdraw funds to creator
    const withdrawalResult = await createWithdrawal(
      creatorWallet.walletType,
      totalAmount.toString(),
      creatorWallet.address,
      {
        campaignId: campaign.id,
        creatorId: campaign.userId
      }
    );
    
    // Record the withdrawal transaction
    await prisma.campaignPayout.create({
      data: {
        campaignId: campaign.id,
        amount: totalAmount,
        currency: creatorWallet.walletType,
        walletAddress: creatorWallet.address,
        transactionId: withdrawalResult.withdrawalId,
        status: 'processing'
      }
    });
    
    // Update all donations to mark them as successfully processed
    await prisma.donation.updateMany({
      where: {
        campaignId: campaign.id,
        status: 'completed'
      },
      data: {
        status: 'processed'
      }
    });
    
    return withdrawalResult;
  } catch (error) {
    console.error('Error processing campaign success payout:', error);
    throw error;
  }
}

/**
 * Handle failed campaign by refunding all donors
 */
async function handleCampaignFailure(campaign: CampaignWithRelations) {
  try {
    // Get all completed donations for the campaign
    const donations = await prisma.donation.findMany({
      where: {
        campaignId: campaign.id,
        status: 'completed',
        refunded: false
      }
    });
    
    // Process refunds for each donation
    const refundPromises = donations.map(async (donation: DonationWithDetails) => {
      try {
        // Get donor wallet if available
        const donorWallet = await prisma.wallet.findFirst({
          where: { userId: donation.userId }
        });
        
        // If no wallet is found, we need an alternative refund method
        const refundAddress = donorWallet ? donorWallet.address : donation.paymentAddress;
        
        if (!refundAddress) {
          throw new Error(`No refund address for donation ${donation.id}`);
        }
        
        // Use CryptoProcessing to send refund
        const refundResult = await createWithdrawal(
          donation.currency,
          donation.amount.toString(),
          refundAddress,
          {
            campaignId: campaign.id,
            creatorId: donation.userId
          }
        );
        
        // Mark donation as refunded
        await prisma.donation.update({
          where: { id: donation.id },
          data: {
            refunded: true,
            status: 'refunded'
          }
        });
        
        return refundResult;
      } catch (error) {
        console.error(`Failed to process refund for donation ${donation.id}:`, error);
        return null;
      }
    });
    
    // Wait for all refunds to process
    const refundResults = await Promise.all(refundPromises);
    return refundResults.filter(Boolean); // Return only successful refunds
    
  } catch (error) {
    console.error('Error processing campaign failure refunds:', error);
    throw error;
  }
} 
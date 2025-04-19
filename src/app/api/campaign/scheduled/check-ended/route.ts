import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * API route to check for campaigns that have ended and should be finalized
 * This is meant to be called by a scheduled job (e.g., daily CRON job)
 */
export async function GET(req: NextRequest) {
  try {
    // Verify API key for security (simple implementation)
    const apiKey = req.headers.get('x-api-key');
    if (apiKey !== process.env.SCHEDULED_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Find active campaigns that have ended
    const endedCampaigns = await prisma.campaign.findMany({
      where: {
        isActive: true,
        endDate: {
          lte: new Date() // End date is less than or equal to now
        }
      }
    });
    
    if (endedCampaigns.length === 0) {
      return NextResponse.json({
        message: 'No campaigns need finalization',
        finalized: 0
      });
    }
    
    // Process each ended campaign
    const results = await Promise.all(
      endedCampaigns.map(async (campaign) => {
        try {
          // Call the finalize endpoint for this campaign
          const finalizationResponse = await fetch(
            `${req.nextUrl.origin}/api/campaign/finalize/${campaign.id}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey || ''
              }
            }
          );
          
          if (!finalizationResponse.ok) {
            const errorData = await finalizationResponse.json();
            return {
              campaignId: campaign.id,
              title: campaign.title,
              success: false,
              error: errorData.error || 'Failed to finalize campaign'
            };
          }
          
          const finalizationResult = await finalizationResponse.json();
          return {
            campaignId: campaign.id,
            title: campaign.title,
            success: true,
            goalMet: finalizationResult.goalMet,
            totalRaised: finalizationResult.totalRaised
          };
        } catch (error) {
          console.error(`Error finalizing campaign ${campaign.id}:`, error);
          return {
            campaignId: campaign.id,
            title: campaign.title,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );
    
    // Count successful finalizations
    const successfulFinalizations = results.filter(result => result.success).length;
    
    return NextResponse.json({
      message: `Processed ${endedCampaigns.length} ended campaigns`,
      finalized: successfulFinalizations,
      results
    });
    
  } catch (error) {
    console.error('Error checking ended campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to check ended campaigns' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createPayment } from '@/lib/cryptoprocessing';
import { PLATFORM_WALLET_ADDRESSES, CAMPAIGN_CREATION_FEE_USD, PAYMENT_SETTINGS } from '@/config/wallet';

export async function POST(req: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user ID from the session
    const userId = session.user.id;

    // Get the request body
    const body = await req.json();
    
    // Extract campaign data
    const { 
      title, 
      category, 
      currency = "USD", // Default to USD if not provided
      amount, 
      duration,  
      shortDescription, 
      detailedDescription, 
      website, 
      imageUrl, 
      cryptoUsagePlan, 
      creatorName, 
      contactEmail,
      socialMedia,
      paymentDetails, // This would include crypto payment info
      creatorWalletAddress // Added creator's wallet address for receiving donations
    } = body;

    // Validate required fields
    const requiredFields = [
      'title', 'category', 'amount', 'duration', 
      'shortDescription', 'detailedDescription', 'cryptoUsagePlan',
      'creatorName', 'contactEmail'
    ];

    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: 'Missing required fields', 
        fields: missingFields 
      }, { status: 400 });
    }

    // Check if wallet address is provided
    if (!creatorWalletAddress) {
      return NextResponse.json({ 
        error: 'Creator wallet address is required to receive funds',
        missingField: 'creatorWalletAddress'
      }, { status: 400 });
    }

    // Calculate end date based on duration (in days)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(duration));

    // Format complete description with metadata
    const fullDescription = `
${shortDescription}

${detailedDescription}

---
Creator: ${creatorName}
Contact: ${contactEmail}
Currency: ${currency}
${website ? `Website: ${website}` : ''}
${socialMedia ? `Social Media: ${socialMedia}` : ''}
`;

    // Check if payment is required (in production)
    if (process.env.NODE_ENV === 'production' && !paymentDetails?.confirmed) {
      // Determine which platform wallet address to use for receiving the fee
      // Default to ETH if currency doesn't match available wallets
      const receivingWalletAddress = PLATFORM_WALLET_ADDRESSES['ETH'];
      
      // Create a payment for $10 using CryptoProcessing API
      try {
        const callbackUrl = `${PAYMENT_SETTINGS.callbackBaseUrl}/api/campaign/payment-callback`;
        const payment = await createPayment(
          CAMPAIGN_CREATION_FEE_USD, // Use constant from config
          'USD',
          callbackUrl,
          {
            userId,
            campaignTitle: title,
            destinationWallet: receivingWalletAddress
          }
        );
        
        // Return payment info to the client for processing
        return NextResponse.json({ 
          requiresPayment: true,
          paymentInfo: payment,
          destinationWallet: receivingWalletAddress,
          message: `Please complete the $${CAMPAIGN_CREATION_FEE_USD} campaign creation payment`
        });
      } catch (paymentError) {
        console.error('Payment creation error:', paymentError);
        return NextResponse.json(
          { error: 'Failed to create payment for campaign fee' },
          { status: 500 }
        );
      }
    }

    // Create the campaign in the database
    const campaign = await prisma.campaign.create({
      data: {
        title,
        description: fullDescription,
        goal: parseFloat(amount),
        raised: 0,
        image: imageUrl || null,
        endDate,
        isActive: true,
        category,
        userId, // Link the campaign to the user
        targetCurrency: currency || "USD", // Use the provided currency or default
        creatorWalletAddress, // Store the creator's wallet address for receiving donations
        // Add campaign update with crypto usage plan
        updates: {
          create: {
            title: 'Cryptocurrency Usage Plan',
            content: cryptoUsagePlan
          }
        }
      },
      include: {
        updates: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Campaign created successfully', 
      campaign 
    });
    
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
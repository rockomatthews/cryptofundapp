import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import prisma from '@/lib/prisma';
import { createPayment } from '@/lib/cryptoprocessing';
import { PLATFORM_WALLET_ADDRESSES, CAMPAIGN_CREATION_FEE_USD, PAYMENT_SETTINGS } from '@/config/wallet';

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
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
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

/**
 * GET handler for retrieving campaigns
 * Supports filtering, sorting, and pagination
 */
export async function GET(req: NextRequest) {
  try {
    // Get URL parameters
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search');
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build where clause for filtering
    const where: Record<string, unknown> = {
      isActive: true,
    };
    
    // Add category filter if provided
    if (category && category !== 'All Categories') {
      where.category = category;
    }
    
    // Add search filter if provided
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Get total count for pagination
    const totalCount = await prisma.campaign.count({ where });
    
    // Build orderBy object for sorting
    const orderBy: Record<string, string> = {};
    // Handle different sort options
    switch (sortBy) {
      case 'endDate':
        orderBy.endDate = order;
        break;
      case 'goal':
        orderBy.goal = order;
        break;
      case 'raised':
        orderBy.raised = order;
        break;
      case 'mostFunded':
        // Calculate percentage funded and sort by that
        orderBy.raised = order;
        break;
      default:
        orderBy.createdAt = order;
    }
    
    // Fetch campaigns with filtering, sorting, and pagination
    const campaigns = await prisma.campaign.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        _count: {
          select: {
            donations: true
          }
        }
      }
    });
    
    // Calculate days left for each campaign
    const campaignsWithDaysLeft = campaigns.map(campaign => {
      let daysLeft = 0;
      if (campaign.endDate) {
        const endDate = new Date(campaign.endDate);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        daysLeft = daysLeft < 0 ? 0 : daysLeft;
      }
      
      // Calculate percentage funded
      const percentFunded = campaign.goal > 0 
        ? Math.round((campaign.raised / campaign.goal) * 100) 
        : 0;
      
      // Use the user's name or a default creator name
      const creatorName = campaign.user?.name || 'Anonymous';
      
      return {
        ...campaign,
        daysLeft,
        percentFunded,
        creatorName,
        donationCount: campaign._count.donations
      };
    });
    
    // Return campaigns with pagination info
    return NextResponse.json({
      campaigns: campaignsWithDaysLeft,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

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
      paymentDetails // This would include crypto payment info
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

    // Get the user's wallet address from their profile
    const userWallet = await prisma.wallet.findFirst({
      where: { 
        userId,
        walletType: currency // Try to find a wallet of the same currency type as the campaign
      }
    });

    // If no wallet found for the specific currency, try to find any wallet
    const creatorWalletAddress = userWallet?.address || 
      (await prisma.wallet.findFirst({ where: { userId } }))?.address;
    
    // If no wallet address is available, create a pending campaign and notify user
    const needsWalletSetup = !creatorWalletAddress;

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
          message: `Please complete the $${CAMPAIGN_CREATION_FEE_USD} campaign creation payment`,
          needsWalletSetup
        });
      } catch (paymentError) {
        console.error('Payment creation error:', paymentError);
        return NextResponse.json(
          { error: 'Failed to create payment for campaign fee' },
          { status: 500 }
        );
      }
    }

    // After parsing the request body, add detailed logging
    console.log('Campaign creation request received:', JSON.stringify({
      userId,
      title: body.title,
      category: body.category,
      currency: body.currency || 'USD',
      hasImage: !!body.imageUrl
    }));

    // Create the campaign in the database
    try {
      console.log('Creating campaign in database:', JSON.stringify({
        title,
        category,
        goal: parseFloat(amount),
        currency: currency || "USD",
        hasWalletAddress: !!creatorWalletAddress,
        needsWalletSetup
      }));
      
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
          creatorWalletAddress, // Use the wallet address from the user's profile
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
      
      console.log('Campaign created successfully:', JSON.stringify({
        campaignId: campaign.id,
        createdAt: campaign.createdAt,
        userId: campaign.userId
      }));
      
      return NextResponse.json({ 
        success: true, 
        message: needsWalletSetup ? 'Campaign created, but you need to set up a wallet to receive funds' : 'Campaign created successfully', 
        campaign,
        needsWalletSetup
      });
    } catch (dbError) {
      console.error('Database error creating campaign:', dbError);
      return NextResponse.json(
        { error: 'Failed to create campaign in database', details: dbError instanceof Error ? dbError.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
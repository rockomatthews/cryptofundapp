import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user ID and email from the session
    const userId = session.user.id;
    const userEmail = session.user.email;

    // First try to find the user in the database
    let user = await prisma.user.findFirst({
      where: { 
        OR: [
          { id: userId },
          { email: userEmail }
        ]
      },
      include: {
        campaigns: true,
        donations: {
          include: {
            campaign: true,
          },
        },
        wallets: true,
      },
    });

    // If user doesn't exist in the database (which can happen with JWT strategy),
    // create a minimal user record based on the session data
    if (!user && userEmail) {
      try {
        user = await prisma.user.create({
          data: {
            id: userId,  // Use the ID from the JWT if available
            email: userEmail,
            name: session.user.name || '',
            image: session.user.image || '',
          },
          include: {
            campaigns: true,
            donations: {
              include: {
                campaign: true,
              },
            },
            wallets: true,
          },
        });
        console.log(`Created new user record for: ${userEmail}`);
      } catch (createError) {
        console.error('Error creating user record:', createError);
        // Fall back to returning minimal profile without DB persistence
        user = {
          id: userId || 'temp-id',
          name: session.user.name || '',
          email: userEmail,
          image: session.user.image || '',
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerified: null,
          wallets: [],
          campaigns: [],
          donations: [],
        };
      }
    }

    // If still no user, return a 404
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Transform wallet data to the expected format
    const walletAddresses: Record<string, string> = {};
    user.wallets.forEach((wallet) => {
      walletAddresses[wallet.walletType] = wallet.address;
    });

    // Calculate total donated amount
    const totalDonated = user.donations.reduce((sum, donation) => sum + donation.amount, 0);

    // Format the response
    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
      bio: '', // Default empty bio
      walletAddresses: walletAddresses || {},
      totalDonated: totalDonated || 0,
      campaigns: user.campaigns || [],
      donations: user.donations || [],
    };

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
} 
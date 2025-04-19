import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
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

    // Get the request body
    const body = await req.json();
    const { username, profilePicture, walletAddresses } = body;

    // First check if the user exists in the database
    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { id: userId },
          { email: userEmail }
        ]
      }
    });

    let updatedUser;

    // If user doesn't exist, create a new user record
    if (!user) {
      try {
        updatedUser = await prisma.user.create({
          data: {
            id: userId,  // Use the ID from the JWT
            email: userEmail,
            name: username || session.user.name || '',
            image: profilePicture || session.user.image || '',
          },
        });
        console.log(`Created new user record during update for: ${userEmail}`);
      } catch (createError) {
        console.error('Error creating user during update:', createError);
        return NextResponse.json(
          { error: 'Failed to create user profile' },
          { status: 500 }
        );
      }
    } else {
      // Update the existing user in the database
      try {
        updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            name: username,
            image: profilePicture,
          },
        });
      } catch (updateError) {
        console.error('Error updating user:', updateError);
        return NextResponse.json(
          { error: 'Failed to update user profile' },
          { status: 500 }
        );
      }
    }

    // For each wallet address, create or update the wallet in the database
    if (walletAddresses && updatedUser) {
      for (const [currency, address] of Object.entries(walletAddresses)) {
        if (address) {
          try {
            // First check if a wallet with this walletType already exists for this user
            const existingWallet = await prisma.wallet.findFirst({
              where: {
                userId: updatedUser.id,
                walletType: currency,
              }
            });

            if (existingWallet) {
              // Update existing wallet
              await prisma.wallet.update({
                where: { id: existingWallet.id },
                data: { address: address as string }
              });
            } else {
              // Create new wallet
              await prisma.wallet.create({
                data: {
                  walletType: currency,
                  address: address as string,
                  provider: 'Manual', // Default provider for manually entered wallets
                  userId: updatedUser.id
                }
              });
            }
          } catch (walletError) {
            console.error(`Error with wallet ${currency}:`, walletError);
            // Continue with other wallets even if one fails
          }
        }
      }
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 
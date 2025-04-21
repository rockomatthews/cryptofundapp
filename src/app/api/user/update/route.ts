import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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
    const { username, profilePicture, walletAddresses, bio } = body;

    console.log('Update request received:', JSON.stringify({
      username: username || 'Not provided',
      profilePictureProvided: !!profilePicture,
      bio: bio || 'Not provided',
      walletAddressesCount: walletAddresses ? Object.keys(walletAddresses).length : 0
    }));

    // First check if the user exists in the database
    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { id: userId },
          { email: userEmail }
        ]
      },
      include: {
        wallets: true,
        profile: true
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
            profile: {
              create: {
                bio: bio || ''
              }
            }
          },
          include: {
            profile: true
          }
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
        // Always update the image if provided, otherwise keep the existing one
        const updateData = {
          name: username,
          ...(profilePicture ? { image: profilePicture } : {}),
          profile: {
            upsert: {
              create: {
                bio: bio || '',
              },
              update: {
                bio: bio || '',
              }
            }
          }
        };
        
        console.log('Updating user with data:', JSON.stringify({
          name: updateData.name,
          imageIncluded: !!profilePicture,
          bioPresent: !!(bio || '')
        }));
        
        updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: updateData,
          include: {
            profile: true
          }
        });
      } catch (updateError) {
        console.error('Error updating user:', updateError);
        return NextResponse.json(
          { error: 'Failed to update user profile' },
          { status: 500 }
        );
      }
    }

    // Handle wallet addresses
    if (walletAddresses && updatedUser) {
      // Get current wallet types in the database
      const existingWalletTypes = user?.wallets.map(w => w.walletType) || [];
      
      // Get wallet types from the request
      const newWalletTypes = Object.keys(walletAddresses);
      
      // Find wallet types to remove (in db but not in request)
      const walletTypesToRemove = existingWalletTypes.filter(
        wType => !newWalletTypes.includes(wType)
      );
      
      // Remove wallets that are no longer in the list
      if (walletTypesToRemove.length > 0) {
        try {
          await prisma.wallet.deleteMany({
            where: {
              userId: updatedUser.id,
              walletType: {
                in: walletTypesToRemove
              }
            }
          });
        } catch (deleteError) {
          console.error('Error removing wallets:', deleteError);
        }
      }

      // Update or create wallets
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

    // Prepare the response with the bio
    const response = {
      success: true, 
      user: {
        ...updatedUser,
        bio: updatedUser?.profile?.bio || ''
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 
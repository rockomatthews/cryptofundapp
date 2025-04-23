import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import prisma from '@/lib/prisma';

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

export async function GET() {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session || !session.user) {
      console.warn('No valid session found:', session);
      return NextResponse.json({ error: 'Unauthorized', fallback: true }, { status: 401 });
    }

    // Get the user ID and email from the session
    const userId = session.user.id;
    const userEmail = session.user.email;

    // Safety check - if no user ID or email, return minimal fallback profile
    if (!userId && !userEmail) {
      console.warn('Session missing both userId and email:', session.user);
      
      // Return a minimal fallback profile with session data
      const fallbackProfile = {
        id: 'temporary-id',
        name: session.user.name || 'User',
        email: session.user.email || null,
        image: session.user.image || null,
        createdAt: new Date(),
        bio: '',
        walletAddresses: {},
        totalDonated: 0,
        campaigns: [],
        donations: [],
        fallback: true,
        profile: null,
      };
      
      return NextResponse.json(fallbackProfile);
    }

    // First try to find the user in the database
    try {
      let user = await prisma.user.findFirst({
        where: { 
          OR: [
            ...(userId ? [{ id: userId }] : []),
            ...(userEmail ? [{ email: userEmail }] : [])
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
          profile: true,  // Include the user profile with bio
        },
      });

      // If user doesn't exist in the database (which can happen with JWT strategy),
      // create a minimal user record based on the session data
      if (!user && userEmail) {
        try {
          user = await prisma.user.create({
            data: {
              ...(userId ? { id: userId } : {}),  // Use the ID from the JWT if available
              email: userEmail,
              name: session.user.name || '',
              image: session.user.image || '',
              profile: {
                create: {
                  bio: ''
                }
              }
            },
            include: {
              campaigns: true,
              donations: {
                include: {
                  campaign: true,
                },
              },
              wallets: true,
              profile: true,
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
            profile: null,
          };
        }
      }

      // If still no user, return a fallback profile
      if (!user) {
        console.warn('User not found and could not be created');
        return NextResponse.json({ 
          id: userId || 'temp-id',
          name: session.user.name || 'Guest User',
          email: userEmail || null,
          image: session.user.image || null,
          createdAt: new Date(),
          bio: '',
          walletAddresses: {},
          totalDonated: 0,
          campaigns: [],
          donations: [],
          fallback: true,
          profile: null,
        });
      }

      // Transform wallet data to the expected format
      const walletAddresses: Record<string, string> = {};
      if (user.wallets && Array.isArray(user.wallets)) {
        user.wallets.forEach((wallet) => {
          walletAddresses[wallet.walletType] = wallet.address;
        });
      }

      // Calculate total donated amount safely
      const totalDonated = Array.isArray(user.donations) 
        ? user.donations.reduce((sum, donation) => sum + (donation.amount || 0), 0)
        : 0;

      // Format the response
      const userProfile = {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
        bio: user.profile?.bio || '', // Get bio from profile if available
        walletAddresses: walletAddresses,
        totalDonated: totalDonated,
        campaigns: Array.isArray(user.campaigns) ? user.campaigns : [],
        donations: Array.isArray(user.donations) ? user.donations : [],
      };

      console.log('Sending user profile to client:', JSON.stringify({
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        image: userProfile.image ? 'Image exists' : 'No image',
        bioExists: !!userProfile.bio,
        walletAddressesCount: Object.keys(walletAddresses).length,
        hasCampaigns: userProfile.campaigns.length > 0,
        hasDonations: userProfile.donations.length > 0
      }));

      return NextResponse.json(userProfile);
    } catch (dbError) {
      console.error('Database error in profile API:', dbError);
      
      // Return a minimal fallback profile with session data
      const fallbackProfile = {
        id: userId || 'temporary-id',
        name: session.user.name || 'User',
        email: userEmail || null,
        image: session.user.image || null,
        createdAt: new Date(),
        bio: '',
        walletAddresses: {},
        totalDonated: 0,
        campaigns: [],
        donations: [],
        fallback: true,
        error: 'Database connection issue',
        profile: null,
      };
      
      return NextResponse.json(fallbackProfile);
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    
    // Return a basic fallback profile for any error
    return NextResponse.json({
      id: 'temporary-id',
      name: 'Guest User',
      email: null,
      image: null,
      createdAt: new Date(),
      bio: '',
      walletAddresses: {},
      totalDonated: 0,
      campaigns: [],
      donations: [],
      fallback: true,
      error: 'Server error',
      profile: null,
    });
  }
} 
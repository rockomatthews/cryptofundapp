import { UserProfile, Campaign } from './types';
import { getUserDonations } from './donationService';

// Mock user data (would come from a database in production)
const mockUsers: Record<string, UserProfile> = {
  'user-1': {
    id: 'user-1',
    name: 'Alice Nakamoto',
    email: 'alice@example.com',
    walletAddresses: {
      'ETH': '0x1234...5678',
      'BTC': '1ABC...XYZ'
    },
    avatar: 'https://randomuser.me/api/portraits/women/42.jpg',
    bio: 'Blockchain enthusiast and developer. Passionate about decentralized finance and web3 technologies.',
    createdAt: new Date('2022-01-15'),
    totalDonated: 8250, // $8,250 USD
    campaigns: [
      {
        id: 'campaign-567890',
        title: 'Decentralized Identity Platform',
        description: 'A blockchain-based platform for self-sovereign identity management.',
        creator: {
          id: 'user-1',
          name: 'Alice Nakamoto',
          walletAddress: '0x1234...5678',
          avatar: 'https://randomuser.me/api/portraits/women/42.jpg'
        },
        goalAmount: 25,
        currency: 'ETH',
        currentAmount: 15.8,
        backers: 23,
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        category: 'Identity',
        image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1024&q=80',
        projectPurpose: 'Our platform enables users to control their digital identities using Ethereum smart contracts.',
        createdAt: new Date('2023-03-10')
      }
    ],
    donations: [] // Will be populated from donationService
  },
  'user-2': {
    id: 'user-2',
    name: 'Bob Buterin',
    email: 'bob@example.com',
    walletAddresses: {
      'ETH': '0xabcd...ef01'
    },
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    bio: 'Crypto investor and advisor. Early Ethereum adopter.',
    createdAt: new Date('2021-11-05'),
    totalDonated: 3150, // $3,150 USD
    campaigns: [],
    donations: [] // Will be populated from donationService
  }
};

// Mock campaign data (for demo purposes)
const mockCampaigns: Campaign[] = [
  {
    id: 'campaign-123456',
    title: 'Blockchain-Based Supply Chain Tracking',
    description: 'We\'re building a decentralized platform that uses blockchain technology to provide end-to-end visibility in global supply chains.',
    creator: {
      id: 'user-3',
      name: 'Charlie Hoskinson',
      walletAddress: 'addr1...789',
      avatar: 'https://randomuser.me/api/portraits/men/67.jpg'
    },
    goalAmount: 50,
    currency: 'ETH',
    currentAmount: 28.5,
    backers: 42,
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    category: 'Infrastructure',
    image: 'https://images.unsplash.com/photo-1639744090758-c3d4fe323c84?ixlib=rb-4.0.3&auto=format&fit=crop&w=1024&q=80',
    projectPurpose: 'Our platform uses Ethereum for smart contracts that automatically execute and enforce agreements between suppliers, manufacturers, and retailers. The cryptocurrency is used for transaction settlement and incentivizing honest reporting of supply chain data.',
    createdAt: new Date('2023-02-15')
  },
  {
    id: 'campaign-567890',
    title: 'Decentralized Identity Platform',
    description: 'A blockchain-based platform for self-sovereign identity management.',
    creator: {
      id: 'user-1',
      name: 'Alice Nakamoto',
      walletAddress: '0x1234...5678',
      avatar: 'https://randomuser.me/api/portraits/women/42.jpg'
    },
    goalAmount: 25,
    currency: 'ETH',
    currentAmount: 15.8,
    backers: 23,
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    category: 'Identity',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1024&q=80',
    projectPurpose: 'Our platform enables users to control their digital identities using Ethereum smart contracts.',
    createdAt: new Date('2023-03-10')
  }
];

/**
 * Get user profile by ID
 * @param userId User ID
 * @returns User profile or null if not found
 */
export function getUserProfile(userId: string): UserProfile | null {
  const user = mockUsers[userId];
  
  if (!user) {
    return null;
  }
  
  // Get the user's donations
  const donations = getUserDonations(userId);
  
  // Return a complete profile with donations
  return {
    ...user,
    donations
  };
}

/**
 * Get mock user (for demo purposes)
 * @returns A random mock user
 */
export function getMockUser(): UserProfile {
  // For demo purposes, return the first user
  const mockUser = mockUsers['user-1'];
  
  // Get their donations
  const donations = getUserDonations(mockUser.id);
  
  return {
    ...mockUser,
    donations
  };
}

/**
 * Get campaigns created by a user
 * @param userId User ID
 * @returns Array of campaigns
 */
export function getUserCampaigns(userId: string): Campaign[] {
  return mockCampaigns.filter(campaign => campaign.creator.id === userId);
}

/**
 * Get all campaigns (for demo purposes)
 * @returns Array of all campaigns
 */
export function getAllCampaigns(): Campaign[] {
  return mockCampaigns;
} 
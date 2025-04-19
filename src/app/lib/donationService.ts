import { Donation } from './types';

// Mock exchange rates (would be fetched from an API in production)
const exchangeRates: Record<string, number> = {
  ETH: 3300,   // 1 ETH = $3,300 USD
  BTC: 63000,  // 1 BTC = $63,000 USD
  USDT: 1,     // 1 USDT = $1 USD (stablecoin)
  SOL: 135,    // 1 SOL = $135 USD
  DOT: 7.5,    // 1 DOT = $7.50 USD
  ADA: 0.45    // 1 ADA = $0.45 USD
};

// Mock donation data (would be fetched from a database in production)
const mockDonations: Donation[] = [
  {
    id: 'don-1',
    campaignId: 'campaign-123456',
    campaignTitle: 'Blockchain-Based Supply Chain Tracking',
    donor: {
      id: 'user-1',
      name: 'Alice Nakamoto',
      walletAddress: '0x1234...5678',
      avatar: 'https://randomuser.me/api/portraits/women/42.jpg'
    },
    amount: 2.5,
    currency: 'ETH',
    usdAmount: 2.5 * exchangeRates.ETH,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    transactionId: 'tx-eth-123',
    message: 'Love this project! Keep up the good work.'
  },
  {
    id: 'don-2',
    campaignId: 'campaign-123456',
    campaignTitle: 'Blockchain-Based Supply Chain Tracking',
    donor: {
      id: 'user-2',
      name: 'Bob Buterin',
      walletAddress: '0xabcd...ef01',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    amount: 0.05,
    currency: 'BTC',
    usdAmount: 0.05 * exchangeRates.BTC,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    transactionId: 'tx-btc-456',
    message: 'Excited to see where this goes!'
  },
  {
    id: 'don-3',
    campaignId: 'campaign-123456',
    campaignTitle: 'Blockchain-Based Supply Chain Tracking',
    donor: {
      id: 'user-3',
      name: 'Charlie Hoskinson',
      walletAddress: 'addr1...789',
      avatar: 'https://randomuser.me/api/portraits/men/67.jpg'
    },
    amount: 1000,
    currency: 'ADA',
    usdAmount: 1000 * exchangeRates.ADA,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    transactionId: 'tx-ada-789',
    message: undefined
  },
  {
    id: 'don-4',
    campaignId: 'campaign-123456',
    campaignTitle: 'Blockchain-Based Supply Chain Tracking',
    donor: {
      id: 'user-4',
      name: 'Diana Sun',
      walletAddress: 'So1abc...def',
      avatar: 'https://randomuser.me/api/portraits/women/22.jpg'
    },
    amount: 10,
    currency: 'SOL',
    usdAmount: 10 * exchangeRates.SOL,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    transactionId: 'tx-sol-101',
    message: 'Great use of blockchain tech!'
  },
  {
    id: 'don-5',
    campaignId: 'campaign-123456',
    campaignTitle: 'Blockchain-Based Supply Chain Tracking',
    donor: {
      id: 'user-5',
      name: 'Eve Wood',
      walletAddress: '0x2468...1357',
      avatar: 'https://randomuser.me/api/portraits/women/56.jpg'
    },
    amount: 500,
    currency: 'USDT',
    usdAmount: 500 * exchangeRates.USDT,
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    transactionId: 'tx-usdt-202',
    message: 'Happy to support!'
  },
  {
    id: 'don-6',
    campaignId: 'campaign-123456',
    campaignTitle: 'Blockchain-Based Supply Chain Tracking',
    donor: {
      id: 'user-6',
      name: 'Frank Miller',
      walletAddress: '0x9876...5432',
      avatar: 'https://randomuser.me/api/portraits/men/41.jpg'
    },
    amount: 4.2,
    currency: 'ETH',
    usdAmount: 4.2 * exchangeRates.ETH,
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    transactionId: 'tx-eth-303',
    message: 'Looking forward to seeing this in action!'
  },
  // Donations for other campaigns
  {
    id: 'don-7',
    campaignId: 'campaign-567890',
    campaignTitle: 'Decentralized Identity Platform',
    donor: {
      id: 'user-1',
      name: 'Alice Nakamoto',
      walletAddress: '0x1234...5678',
      avatar: 'https://randomuser.me/api/portraits/women/42.jpg'
    },
    amount: 1.2,
    currency: 'ETH',
    usdAmount: 1.2 * exchangeRates.ETH,
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    transactionId: 'tx-eth-404',
    message: 'Great concept!'
  }
];

/**
 * Get exchange rate for a cryptocurrency
 * @param currency Currency code (ETH, BTC, etc.)
 * @returns Exchange rate to USD
 */
export function getExchangeRate(currency: string): number {
  return exchangeRates[currency] || 0;
}

/**
 * Convert cryptocurrency amount to USD
 * @param amount Amount in cryptocurrency
 * @param currency Currency code
 * @returns Equivalent amount in USD
 */
export function convertToUSD(amount: number, currency: string): number {
  const rate = getExchangeRate(currency);
  return amount * rate;
}

/**
 * Get donation leaderboard for a campaign
 * @param campaignId Campaign ID
 * @param limit Number of top donors to return
 * @returns Array of donations sorted by USD amount
 */
export function getCampaignLeaderboard(campaignId: string, limit: number = 5): Donation[] {
  // Filter donations for this campaign
  const campaignDonations = mockDonations.filter(
    donation => donation.campaignId === campaignId
  );
  
  // Sort by USD amount (highest first)
  const sortedDonations = campaignDonations.sort(
    (a, b) => b.usdAmount - a.usdAmount
  );
  
  // Return top donors
  return sortedDonations.slice(0, limit);
}

/**
 * Get all donations for a campaign
 * @param campaignId Campaign ID
 * @returns Array of donations
 */
export function getCampaignDonations(campaignId: string): Donation[] {
  return mockDonations.filter(donation => donation.campaignId === campaignId);
}

/**
 * Get all donations by a user
 * @param userId User ID
 * @returns Array of donations
 */
export function getUserDonations(userId: string): Donation[] {
  return mockDonations.filter(donation => donation.donor.id === userId);
}

/**
 * Record a new donation
 * @param donation Donation data
 * @returns Created donation with ID
 */
export function recordDonation(donation: Omit<Donation, 'id' | 'usdAmount'>): Donation {
  const usdAmount = convertToUSD(donation.amount, donation.currency);
  
  const newDonation: Donation = {
    ...donation,
    id: `don-${Date.now()}`,
    usdAmount
  };
  
  // In a real app, this would save to a database
  mockDonations.push(newDonation);
  
  return newDonation;
} 
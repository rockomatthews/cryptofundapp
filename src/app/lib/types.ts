/**
 * Shared types for the CryptoFund application
 */

// Campaign data structure
export interface Campaign {
  id: string;
  title: string;
  description: string;
  creator: {
    id: string;
    name: string;
    avatar?: string;
    walletAddress: string;
  };
  goalAmount: number;
  currency: string;
  currentAmount: number;
  backers: number;
  endDate: Date;
  category: string;
  image: string;
  projectPurpose: string;
  createdAt: Date;
}

// Donation data structure
export interface Donation {
  id: string;
  campaignId: string;
  campaignTitle: string;
  donor: {
    id: string;
    name: string;
    walletAddress: string;
    avatar?: string;
  };
  amount: number;
  currency: string;
  usdAmount: number; // Converted amount in USD
  timestamp: Date;
  transactionId: string;
  message?: string;
}

// User profile data
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  walletAddresses: {
    [currency: string]: string; // Currency code -> wallet address
  };
  avatar?: string;
  bio?: string;
  createdAt: Date;
  totalDonated: number; // In USD
  campaigns: Campaign[];
  donations: Donation[];
}

// Exchange rate data
export interface ExchangeRate {
  currency: string;
  usdRate: number; // 1 unit of currency = X USD
  lastUpdated: Date;
} 
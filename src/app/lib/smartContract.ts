/**
 * Smart contract logic for CryptoFund platform
 * 
 * This file outlines the logic that would be implemented in actual blockchain smart contracts.
 * In a production environment, these would be deployed Solidity contracts on Ethereum or other chains.
 */

// Platform owner wallet addresses for different cryptocurrencies
export const platformOwnerWallets: Record<string, string> = {
  ETH: "0xYourEthereumWalletAddressHere",
  BTC: "YourBitcoinWalletAddressHere",
  SOL: "YourSolanaWalletAddressHere",
  DOT: "YourPolkadotWalletAddressHere",
  // Add more cryptocurrency wallet addresses as needed
};

export interface Campaign {
  id: string;
  title: string;
  description: string;
  creator: string; // wallet address
  goalAmount: number;
  currency: string; // cryptocurrency symbol (BTC, ETH, etc.)
  currentAmount: number;
  backers: number;
  endDate: Date;
  projectPurpose: string; // how the cryptocurrency will be used in the project
}

export interface Contribution {
  campaignId: string;
  contributor: string; // wallet address
  amount: number;
  currency: string;
  timestamp: Date;
}

/**
 * Smart contract logic for campaign funding and refunds
 * 
 * The main functionality includes:
 * 1. All-or-nothing funding model (like Kickstarter)
 * 2. 5% platform fee only on successful campaigns
 * 3. Project must use the raised cryptocurrency in their operations
 * 4. Automatic refunds if goal is not reached by deadline
 */

/**
 * Create a new campaign
 * @param creator Creator's wallet address
 * @param title Campaign title
 * @param description Campaign description
 * @param goalAmount Funding target amount
 * @param currency Cryptocurrency to be raised
 * @param durationDays Campaign duration in days
 * @param projectPurpose Description of how the cryptocurrency will be used
 */
export function createCampaign(
  creator: string,
  title: string,
  description: string,
  goalAmount: number,
  currency: string,
  durationDays: number,
  projectPurpose: string
): Campaign {
  // Validation
  if (goalAmount <= 0) {
    throw new Error('Goal amount must be greater than zero');
  }
  
  if (durationDays < 1 || durationDays > 90) {
    throw new Error('Campaign duration must be between 1 and 90 days');
  }
  
  if (!projectPurpose || projectPurpose.trim().length < 50) {
    throw new Error('You must provide a detailed explanation of how the cryptocurrency will be used in your project');
  }
  
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + durationDays);
  
  // In a real smart contract, this would create a new campaign on the blockchain
  return {
    id: `campaign-${Date.now()}`,
    title,
    description,
    creator,
    goalAmount,
    currency,
    currentAmount: 0,
    backers: 0,
    endDate,
    projectPurpose
  };
}

/**
 * Contribute to a campaign
 * @param campaignId Campaign ID
 * @param contributor Contributor's wallet address
 * @param amount Contribution amount
 * @param currency Cryptocurrency
 */
export function contribute(
  campaignId: string,
  contributor: string,
  amount: number,
  currency: string
): Contribution {
  // Validation
  if (amount <= 0) {
    throw new Error('Contribution amount must be greater than zero');
  }
  
  // In a real smart contract:
  // 1. The funds would be held in escrow by the contract
  // 2. The campaign's current amount would be updated
  // 3. The contribution would be recorded on the blockchain
  
  return {
    campaignId,
    contributor,
    amount,
    currency,
    timestamp: new Date()
  };
}

/**
 * Finalize a campaign after its deadline
 * This is automatically called by the smart contract when the campaign ends
 * @param campaignId Campaign ID
 * @returns Object with success status and distribution details
 */
export function finalizeCampaign(campaignId: string): { 
  success: boolean;
  creatorAmount?: number;
  platformFee?: number;
  platformWallet?: string;
  refundAmount?: number;
} {
  // Get campaign details (in a real contract, this would be from blockchain storage)
  const campaign = { id: campaignId, goalAmount: 100, currentAmount: 120, currency: 'ETH' } as Campaign;
  
  // Check if campaign reached its goal
  if (campaign.currentAmount >= campaign.goalAmount) {
    // Campaign successful - calculate platform fee (5%)
    const platformFee = campaign.currentAmount * 0.05;
    const creatorAmount = campaign.currentAmount - platformFee;
    
    // Get the platform owner's wallet for this cryptocurrency
    const platformWallet = campaign.currency in platformOwnerWallets 
      ? platformOwnerWallets[campaign.currency]
      : platformOwnerWallets.ETH;
    
    // In a real smart contract:
    // 1. Transfer the platform fee to the owner's wallet for this cryptocurrency
    // 2. Transfer the remaining funds to the creator's wallet
    
    return {
      success: true,
      creatorAmount,
      platformFee,
      platformWallet
    };
  } else {
    // Campaign failed - refund all contributions
    // In a real smart contract, this would automatically refund all contributors
    
    return {
      success: false,
      refundAmount: campaign.currentAmount
    };
  }
}

/**
 * Check if a campaign is active
 * @param campaignId Campaign ID
 * @returns Boolean indicating if the campaign is still active
 */
export function isCampaignActive(campaignId: string): boolean {
  // Get campaign details (in a real contract, this would be from blockchain storage)
  const campaign = { id: campaignId, endDate: new Date(Date.now() + 86400000) } as Campaign;
  
  return new Date() < campaign.endDate;
}

/**
 * Get platform fee percentage
 * @returns The platform fee percentage (5%)
 */
export function getPlatformFee(): number {
  return 5; // 5% platform fee
} 
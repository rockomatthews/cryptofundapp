/**
 * Mock wallet connectors for development environment
 * These functions simulate wallet connections without making actual API calls
 */

import type { WalletConnection } from './paymentProcessor';

// Sample wallet addresses for each cryptocurrency
const MOCK_WALLET_ADDRESSES = {
  ETH: '0x1234567890123456789012345678901234567890',
  BTC: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5',
  USDT: '0x9876543210987654321098765432109876543210',
  SOL: '5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAQmNTe5izzKKBF',
  DOT: '12xtGHdG5czwuZ8LrQqt2oVSvhaWfWzWsRdnpj6jP4qEBExY',
  ADA: 'addr1qx2kd28nq8ac5prwh5ywalt6n3re5m4arjk73vxnf3hscedcyyk4uv33nj88t7tlpfzemd3cxw2k2m9xkh6lwdfckwdqvxrdf7'
};

/**
 * Connect to a mock wallet
 * @param walletType Type of wallet (ETH, BTC, etc.)
 * @returns Mock wallet connection
 */
export async function connectMockWallet(walletType: string): Promise<WalletConnection> {
  console.log(`[MOCK] Connecting to ${walletType} wallet`);
  
  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    walletType,
    address: MOCK_WALLET_ADDRESSES[walletType as keyof typeof MOCK_WALLET_ADDRESSES] || 'unknown-address',
    provider: `mock-${walletType.toLowerCase()}-provider`,
    connected: true,
    publicKey: `mock-public-key-${walletType}`
  };
}

/**
 * Mock function to register a wallet with the CryptoProcessing service
 * @param walletType Type of cryptocurrency
 * @param walletAddress Wallet address
 */
export async function registerMockWallet(walletType: string, walletAddress: string): Promise<void> {
  console.log(`[MOCK] Registering ${walletType} wallet with address ${walletAddress}`);
  
  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate success
  return;
}

/**
 * Mock function to process a donation
 * @param amount Amount to donate
 * @param currency Currency to donate in
 * @param walletAddress Wallet address
 * @returns Mock transaction ID
 */
export async function processMockDonation(
  amount: number,
  currency: string,
  walletAddress: string
): Promise<string> {
  console.log(`[MOCK] Processing donation of ${amount} ${currency} from ${walletAddress}`);
  
  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate a mock transaction ID
  const mockTxId = `mock-tx-${currency}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  
  return mockTxId;
} 
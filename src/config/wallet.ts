/**
 * Wallet configuration for the Crypto GoFundMe platform
 * This file defines platform wallet addresses and payment processing settings
 */

/**
 * Platform wallet addresses for receiving funds
 * These addresses are used for:
 * 1. Receiving platform fees from campaigns
 * 2. Emergency withdrawal of funds if needed
 * 
 * IMPORTANT: Replace example addresses with actual secure wallet addresses before deployment
 */
export const PLATFORM_WALLET_ADDRESSES: Record<string, string> = {
  // Main cryptocurrency wallets for the platform
  BTC: process.env.PLATFORM_BTC_WALLET || '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Example address - REPLACE WITH REAL ADDRESS
  ETH: process.env.PLATFORM_ETH_WALLET || '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // Example address - REPLACE WITH REAL ADDRESS
  SOL: process.env.PLATFORM_SOL_WALLET || '5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CertuRkn9ms', // Example address - REPLACE WITH REAL ADDRESS
  USDT: process.env.PLATFORM_USDT_WALLET || '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // Example address (ETH network) - REPLACE WITH REAL ADDRESS
  USDC: process.env.PLATFORM_USDC_WALLET || '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // Example address (ETH network) - REPLACE WITH REAL ADDRESS
  DOT: process.env.PLATFORM_DOT_WALLET || '1FRMM8PEiWXYax7rpS6X4XZX1aAaxSWx1CrKTyrVYhV24fg', // Example address - REPLACE WITH REAL ADDRESS
  ADA: process.env.PLATFORM_ADA_WALLET || 'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgse35a3x', // Example address - REPLACE WITH REAL ADDRESS
};

/**
 * Platform admin wallet for receiving platform fees
 * By default, we use the ETH wallet, but this can be configured separately
 */
export const PLATFORM_ADMIN_WALLET = process.env.PLATFORM_ADMIN_WALLET || PLATFORM_WALLET_ADDRESSES.ETH;

/**
 * Platform fee percentage
 * This is the percentage that the platform takes from each donation
 */
export const PLATFORM_FEE_PERCENTAGE = 3.5; // 3.5%

/**
 * Campaign creation fee in USD
 * This is the fee that creators pay to create a new campaign
 */
export const CAMPAIGN_CREATION_FEE_USD = 10; // $10 USD

/**
 * Get platform wallet address for a specific currency
 * @param currency Currency code (BTC, ETH, etc.)
 * @returns The platform wallet address for the specified currency
 */
export function getPlatformWallet(currency: string): string {
  const upperCurrency = currency.toUpperCase();
  return PLATFORM_WALLET_ADDRESSES[upperCurrency] || PLATFORM_WALLET_ADDRESSES.ETH;
}

/**
 * Check if a currency is supported by the platform
 * @param currency Currency code to check
 * @returns True if the currency is supported, false otherwise
 */
export function isCurrencySupported(currency: string): boolean {
  const upperCurrency = currency.toUpperCase();
  return upperCurrency in PLATFORM_WALLET_ADDRESSES;
}

/**
 * Get list of supported currencies
 * @returns Array of supported currency codes
 */
export function getSupportedCurrencies(): string[] {
  return Object.keys(PLATFORM_WALLET_ADDRESSES);
}

/**
 * Payment processing settings
 */
export const PAYMENT_SETTINGS = {
  // Callback URL for payment notifications (used by CryptoProcessing API)
  CALLBACK_URL: process.env.PAYMENT_CALLBACK_URL || 'https://example.com/api/donations/callback',
  
  // Return URL after payment completion (used by CryptoProcessing API)
  RETURN_URL: process.env.PAYMENT_RETURN_URL || 'https://example.com/payment/success',
  
  // Cancel URL if payment is cancelled (used by CryptoProcessing API)
  CANCEL_URL: process.env.PAYMENT_CANCEL_URL || 'https://example.com/payment/cancel',
  
  // Base URL for callbacks
  callbackBaseUrl: process.env.CALLBACK_BASE_URL || 'https://example.com'
}; 
/**
 * Platform wallet addresses for receiving fees and donations
 */
export const platformWallets = {
  // Bitcoin wallet address for the platform
  BTC: process.env.PLATFORM_BTC_WALLET || '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Example address, replace with real platform address
  
  // Ethereum wallet address for the platform
  ETH: process.env.PLATFORM_ETH_WALLET || '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // Example address, replace with real platform address
  
  // USDT wallet address for the platform (ERC-20)
  USDT: process.env.PLATFORM_USDT_WALLET || '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // Example address, replace with real platform address
  
  // USDC wallet address for the platform (ERC-20)
  USDC: process.env.PLATFORM_USDC_WALLET || '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // Example address, replace with real platform address
}

/**
 * Get the platform wallet address for a specific cryptocurrency
 * @param currency The cryptocurrency code (BTC, ETH, etc.)
 * @returns The wallet address for the specified cryptocurrency
 */
export function getPlatformWallet(currency: string): string {
  const upperCurrency = currency.toUpperCase();
  if (upperCurrency in platformWallets) {
    return platformWallets[upperCurrency as keyof typeof platformWallets];
  }
  throw new Error(`No platform wallet configured for currency: ${currency}`);
}

/**
 * Check if a cryptocurrency is supported by the platform
 * @param currency The cryptocurrency code
 * @returns True if the currency is supported
 */
export function isCurrencySupported(currency: string): boolean {
  return currency.toUpperCase() in platformWallets;
}

/**
 * Get list of supported cryptocurrencies
 * @returns Array of supported cryptocurrency codes
 */
export function getSupportedCurrencies(): string[] {
  return Object.keys(platformWallets);
} 
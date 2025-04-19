import { Connection, PublicKey } from '@solana/web3.js';
// Define TokenInfo interface locally instead of importing it
interface TokenInfo {
  chainId: number;
  address: string;
  name: string;
  decimals: number;
  symbol: string;
  logoURI?: string;
  tags?: string[];
  extensions?: Record<string, unknown>;
}
import fetch from 'cross-fetch';

// Jupiter API endpoints
const JUPITER_API_BASE = 'https://quote-api.jup.ag/v6';

/**
 * Get the best swap route using Jupiter API
 */
export async function getJupiterRoute(
  connection: Connection,
  fromToken: string,
  toToken: string,
  amount: number,
  slippage: number = 1.0 // default 1% slippage
): Promise<any> {
  try {
    // Fetch available routes from Jupiter API
    const response = await fetch(`${JUPITER_API_BASE}/quote`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputMint: fromToken,
        outputMint: toToken,
        amount: amount.toString(),
        slippageBps: Math.floor(slippage * 100),
      })
    });

    if (!response.ok) {
      throw new Error(`Jupiter API error: ${response.statusText}`);
    }

    const routes = await response.json();
    
    // Return the best route
    return routes.data[0];
  } catch (error) {
    console.error('Error getting Jupiter route:', error);
    throw error;
  }
}

/**
 * Execute a swap through Jupiter
 */
export async function executeJupiterSwap(
  connection: Connection,
  wallet: any,
  route: any
): Promise<string> {
  try {
    // Prepare the transaction
    const swapResponse = await fetch(`${JUPITER_API_BASE}/swap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        route,
        userPublicKey: wallet.publicKey.toString(),
      })
    });

    if (!swapResponse.ok) {
      throw new Error(`Jupiter swap error: ${swapResponse.statusText}`);
    }

    const swapResult = await swapResponse.json();
    
    // Sign and send the transaction
    const { txid } = await wallet.signAndSendTransaction(swapResult.swapTransaction);
    
    return txid;
  } catch (error) {
    console.error('Error executing Jupiter swap:', error);
    throw error;
  }
}

/**
 * Get the current price of a token in USD
 */
export async function getTokenPrice(tokenMint: string): Promise<number> {
  try {
    // Use Coingecko API to get token price
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=${tokenMint}&vs_currencies=usd`);
    
    if (!response.ok) {
      throw new Error(`Coingecko API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data[tokenMint.toLowerCase()].usd;
  } catch (error) {
    console.error('Error getting token price:', error);
    return 0;
  }
}

/**
 * Calculate USD value of token amount
 */
export function calculateUsdValue(amount: number, price: number, decimals: number): number {
  return (amount / Math.pow(10, decimals)) * price;
}

/**
 * Get all supported tokens
 */
export async function getSupportedTokens(): Promise<TokenInfo[]> {
  try {
    const response = await fetch('https://token.jup.ag/strict');
    if (!response.ok) {
      throw new Error(`Error fetching token list: ${response.statusText}`);
    }
    
    const tokens = await response.json();
    return tokens;
  } catch (error) {
    console.error('Error getting supported tokens:', error);
    return [];
  }
} 
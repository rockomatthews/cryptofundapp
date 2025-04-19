import fetch from 'cross-fetch';

// CryptoProcessing API configuration
const CRYPTO_PROCESSING_API = 'https://api.cryptoprocessing.com/api/v1';
const API_KEY = process.env.CRYPTO_PROCESSING_API_KEY || 'your_api_key';

// Supported cryptocurrencies
export const SUPPORTED_CURRENCIES = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDT: 'tether',
  SOL: 'solana',
  DOT: 'polkadot',
  ADA: 'cardano'
};

/**
 * Create a payment address for receiving donations
 */
export async function createPaymentAddress(
  currency: string,
  callbackUrl: string,
  metadata: {
    campaignId: string,
    userId: string
  }
): Promise<string> {
  try {
    const response = await fetch(`${CRYPTO_PROCESSING_API}/addresses`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currency: SUPPORTED_CURRENCIES[currency as keyof typeof SUPPORTED_CURRENCIES],
        callback_url: callbackUrl,
        metadata: JSON.stringify(metadata)
      })
    });

    if (!response.ok) {
      throw new Error(`CryptoProcessing API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.address;
  } catch (error) {
    console.error('Error creating payment address:', error);
    throw error;
  }
}

/**
 * Process a currency exchange (for converting donated funds)
 */
export async function convertCurrency(
  fromCurrency: string,
  toCurrency: string,
  amount: string,
  destinationAddress: string
): Promise<{
  exchangeId: string;
  estimatedCompletion: string;
}> {
  try {
    const response = await fetch(`${CRYPTO_PROCESSING_API}/exchanges`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from_currency: SUPPORTED_CURRENCIES[fromCurrency as keyof typeof SUPPORTED_CURRENCIES],
        to_currency: SUPPORTED_CURRENCIES[toCurrency as keyof typeof SUPPORTED_CURRENCIES],
        amount,
        destination_address: destinationAddress
      })
    });

    if (!response.ok) {
      throw new Error(`CryptoProcessing API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      exchangeId: data.id,
      estimatedCompletion: data.estimated_completion_time
    };
  } catch (error) {
    console.error('Error converting currency:', error);
    throw error;
  }
}

/**
 * Check the status of a payment
 */
export async function checkPaymentStatus(paymentId: string): Promise<{
  status: 'pending' | 'completed' | 'failed';
  amount: string;
  currency: string;
  txHash?: string;
}> {
  try {
    const response = await fetch(`${CRYPTO_PROCESSING_API}/payments/${paymentId}`, {
      headers: {
        'Authorization': `Token ${API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`CryptoProcessing API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      status: mapPaymentStatus(data.status),
      amount: data.amount,
      currency: data.currency,
      txHash: data.transaction_hash
    };
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw error;
  }
}

/**
 * Create a withdrawal to pay out campaign funds
 */
export async function createWithdrawal(
  currency: string,
  amount: string,
  address: string,
  metadata: {
    campaignId: string,
    creatorId: string
  }
): Promise<{
  withdrawalId: string;
  fee: string;
}> {
  try {
    const response = await fetch(`${CRYPTO_PROCESSING_API}/withdrawals`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currency: SUPPORTED_CURRENCIES[currency as keyof typeof SUPPORTED_CURRENCIES],
        amount,
        address,
        metadata: JSON.stringify(metadata)
      })
    });

    if (!response.ok) {
      throw new Error(`CryptoProcessing API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      withdrawalId: data.id,
      fee: data.fee
    };
  } catch (error) {
    console.error('Error creating withdrawal:', error);
    throw error;
  }
}

/**
 * Get current exchange rates
 */
export async function getExchangeRates(): Promise<Record<string, Record<string, number>>> {
  try {
    const response = await fetch(`${CRYPTO_PROCESSING_API}/rates`, {
      headers: {
        'Authorization': `Token ${API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`CryptoProcessing API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw error;
  }
}

// Helper function to map API status to our application status
function mapPaymentStatus(apiStatus: string): 'pending' | 'completed' | 'failed' {
  const statusMap: Record<string, 'pending' | 'completed' | 'failed'> = {
    'new': 'pending',
    'pending': 'pending',
    'processing': 'pending',
    'completed': 'completed',
    'confirmed': 'completed',
    'failed': 'failed',
    'canceled': 'failed',
    'error': 'failed'
  };
  
  return statusMap[apiStatus.toLowerCase()] || 'pending';
} 
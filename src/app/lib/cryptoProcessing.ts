/**
 * CryptoProcessing API utility functions
 * Documentation: https://docs.cryptoprocessing.io/
 */

const API_URL = 'https://api.cryptoprocessing.io/api/v1';
const API_KEY = process.env.CRYPTO_PROCESSING_API_KEY;

export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  callbackUrl: string;
  returnUrl: string;
  orderId?: string;
  email?: string;
  destination?: string; // Destination wallet address
}

export interface PaymentResponse {
  id: string;
  status: string;
  redirectUrl: string;
  amount: number;
  currency: string;
  createdAt: string;
}

/**
 * Creates a new crypto payment
 * @param paymentData Payment request data
 * @returns Payment response with redirect URL
 */
export async function createPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
  try {
    // Import wallet addresses only when needed to avoid circular dependencies
    const { PLATFORM_WALLET_ADDRESSES } = await import('@/config/wallet');
    
    // If no destination address is provided, use the platform's wallet address for the currency
    if (!paymentData.destination && paymentData.currency && 
        PLATFORM_WALLET_ADDRESSES[paymentData.currency.toUpperCase()]) {
      paymentData.destination = PLATFORM_WALLET_ADDRESSES[paymentData.currency.toUpperCase()];
    }
    
    const response = await fetch(`${API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Payment creation failed: ${errorData.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
}

/**
 * Gets the status of a payment
 * @param paymentId The ID of the payment
 * @returns Payment status details
 */
export async function getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
  try {
    const response = await fetch(`${API_URL}/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to get payment status: ${errorData.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting payment status:', error);
    throw error;
  }
}

/**
 * Gets the list of supported cryptocurrencies
 * @returns List of supported cryptocurrencies
 */
export async function getSupportedCurrencies(): Promise<string[]> {
  try {
    const response = await fetch(`${API_URL}/currencies`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to get currencies: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    return data.currencies;
  } catch (error) {
    console.error('Error getting supported currencies:', error);
    throw error;
  }
} 
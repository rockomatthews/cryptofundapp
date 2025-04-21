import axios from 'axios';
import { PLATFORM_WALLET_ADDRESSES, PAYMENT_SETTINGS } from '../config/wallet';

const API_BASE_URL = process.env.CRYPTO_PROCESSING_API_URL || 'https://api.cryptoprocessing.com/v1';
const API_KEY = process.env.CRYPTO_PROCESSING_API_KEY;

interface CreatePaymentResponse {
  paymentId: string;
  address: string;
  status: string;
}

interface ExchangeStatusResponse {
  status: string;
  fromAmount: string;
  toAmount: string;
  transactionHash?: string;
}

interface ExchangeRateResponse {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
}

interface PaymentStatusResponse {
  status: 'pending' | 'completed' | 'failed';
  amount: string;
  currency: string;
  txHash?: string;
}

/**
 * Create a new cryptocurrency payment
 */
export async function createPayment(
  amount: number,
  currency: string,
  callbackUrl: string = PAYMENT_SETTINGS.CALLBACK_URL,
  metadata: Record<string, string | number | boolean>,
  destinationAddress?: string
): Promise<CreatePaymentResponse> {
  try {
    // Use the provided destination address or fall back to the platform wallet address
    const recipientAddress = destinationAddress || PLATFORM_WALLET_ADDRESSES[currency];
    
    if (!recipientAddress) {
      throw new Error(`No wallet address configured for currency: ${currency}`);
    }

    const response = await axios.post(
      `${API_BASE_URL}/payments`,
      {
        amount,
        currency,
        callback_url: callbackUrl,
        metadata: JSON.stringify(metadata),
        destination_address: recipientAddress,
        return_url: PAYMENT_SETTINGS.RETURN_URL,
        cancel_url: PAYMENT_SETTINGS.CANCEL_URL,
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      paymentId: response.data.payment_id,
      address: response.data.address,
      status: response.data.status,
    };
  } catch (error) {
    console.error('Error creating payment with CryptoProcessing:', error);
    throw new Error('Failed to create payment');
  }
}

/**
 * Check the status of a payment
 */
export async function checkPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/payments/${paymentId}`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      }
    );

    return {
      status: mapPaymentStatus(response.data.status),
      amount: response.data.amount,
      currency: response.data.currency,
      txHash: response.data.transaction_hash,
    };
  } catch (error) {
    console.error('Error checking payment status from CryptoProcessing:', error);
    throw new Error('Failed to check payment status');
  }
}

/**
 * Get the status of an exchange transaction
 */
export async function getExchangeStatus(exchangeId: string): Promise<ExchangeStatusResponse> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/exchanges/${exchangeId}`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      }
    );

    return {
      status: response.data.status,
      fromAmount: response.data.from_amount,
      toAmount: response.data.to_amount,
      transactionHash: response.data.transaction_hash,
    };
  } catch (error) {
    console.error('Error getting exchange status from CryptoProcessing:', error);
    throw new Error('Failed to get exchange status');
  }
}

/**
 * Get exchange rates between cryptocurrencies
 */
export async function getExchangeRates(
  fromCurrency: string,
  toCurrency: string
): Promise<ExchangeRateResponse> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/rates?from=${fromCurrency}&to=${toCurrency}`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      }
    );

    return {
      fromCurrency,
      toCurrency,
      rate: response.data.rate,
    };
  } catch (error) {
    console.error('Error getting exchange rates from CryptoProcessing:', error);
    throw new Error('Failed to get exchange rates');
  }
}

/**
 * Create a currency exchange transaction
 */
export async function createExchange(
  fromCurrency: string,
  toCurrency: string,
  amount: number,
  destinationAddress: string = PLATFORM_WALLET_ADDRESSES[toCurrency],
  callbackUrl: string = PAYMENT_SETTINGS.CALLBACK_URL,
  metadata: Record<string, string | number | boolean>
): Promise<string> {
  try {
    if (!destinationAddress) {
      throw new Error(`No wallet address configured for currency: ${toCurrency}`);
    }

    const response = await axios.post(
      `${API_BASE_URL}/exchanges`,
      {
        from_currency: fromCurrency,
        to_currency: toCurrency,
        amount,
        destination_address: destinationAddress,
        callback_url: callbackUrl,
        metadata: JSON.stringify(metadata),
        return_url: PAYMENT_SETTINGS.RETURN_URL,
        cancel_url: PAYMENT_SETTINGS.CANCEL_URL,
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.exchange_id;
  } catch (error) {
    console.error('Error creating exchange with CryptoProcessing:', error);
    throw new Error('Failed to create exchange');
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
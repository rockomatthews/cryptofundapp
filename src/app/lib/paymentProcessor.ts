/**
 * CryptoProcessing API integration for handling multi-cryptocurrency payments
 * 
 * This module provides real integration with the CryptoProcessing API:
 * 1. Wallet connection for multiple cryptocurrency types
 * 2. Donation processing for campaigns
 * 3. Transaction status tracking
 * 
 * API Documentation: https://docs.cryptoprocessing.io/
 */

// Define interfaces for our payment processing
interface WalletConnection {
  walletType: string;
  address: string;
  provider: string;
  connected: boolean;
  publicKey?: string;
}

interface PaymentRequest {
  campaignId: string;
  amount: number;
  currency: string;
  walletAddress: string;
  donorId?: string;
  message?: string;
}

interface PaymentResponse {
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
  walletAddress: string;
  campaignId: string;
  amount: number;
  currency: string;
  timestamp: Date;
  blockchainTxId?: string;
}

interface ApiCredentials {
  apiKey: string;
  merchantId: string;
  // webhookSecret removed as it's not used by CryptoProcessing API
}

// Define types for wallet providers
interface EthereumProvider {
  request: (args: {method: string; params?: any[]}) => Promise<any>;
  on: (event: string, listener: (...args: any[]) => void) => void;
}

interface SolanaProvider {
  connect: () => Promise<{publicKey: {toString: () => string}}>;
  signTransaction: (transaction: any) => Promise<{serialize: () => Uint8Array}>;
  sendRawTransaction: (data: Uint8Array) => Promise<string>;
}

// Define the payment status response type
interface PaymentStatusResponse {
  invoice_id: string;
  status: string;
  transactions?: Array<{hash: string}>;
  [key: string]: any; // For other properties that might be in the response
}

// Create a more specific interface for API responses
interface ApiResponse {
  invoice_id?: string;
  status?: string;
  transactions?: Array<{hash: string}>;
  address?: string;
  [key: string]: unknown;
}

// Create a custom error type to better handle API errors
class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// Create a singleton class for managing cryptocurrency payments
class CryptoPaymentProcessor {
  private static instance: CryptoPaymentProcessor;
  private apiCredentials: ApiCredentials = {
    apiKey: process.env.NEXT_PUBLIC_CRYPTO_PROCESSING_API_KEY || '',
    merchantId: process.env.NEXT_PUBLIC_CRYPTO_PROCESSING_STORE_ID || ''
  };
  private apiEndpoint: string = 'https://api.cryptoprocessing.io/api/v1';
  private connectedWallets: Map<string, WalletConnection> = new Map();
  private walletProviders: Map<string, EthereumProvider | SolanaProvider> = new Map();

  private constructor() {
    // Private constructor to enforce singleton pattern
    this.initializeWalletProviders();
  }

  public static getInstance(): CryptoPaymentProcessor {
    if (!CryptoPaymentProcessor.instance) {
      CryptoPaymentProcessor.instance = new CryptoPaymentProcessor();
    }
    return CryptoPaymentProcessor.instance;
  }

  /**
   * Initialize wallet provider connections
   * This sets up listeners for various wallet providers (MetaMask, Phantom, etc.)
   */
  private initializeWalletProviders(): void {
    // Listen for wallet providers being available in the browser
    if (typeof window !== 'undefined') {
      // Ethereum/MetaMask
      if (window.ethereum) {
        this.walletProviders.set('ETH', window.ethereum);
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length === 0) {
            // User disconnected their wallet
            this.disconnectWallet('ETH');
          }
        });
      }

      // Add other wallet providers as needed
      // For example, Phantom for Solana
      if (window.solana) {
        this.walletProviders.set('SOL', window.solana);
      }
    }
  }

  /**
   * Connect a cryptocurrency wallet using the appropriate provider
   * @param walletType The cryptocurrency type (ETH, BTC, etc)
   * @param provider The wallet provider name (MetaMask, BitPay, etc)
   * @returns Connected wallet information
   */
  async connectWallet(walletType: string, provider: string): Promise<WalletConnection | null> {
    console.log(`Connecting ${walletType} wallet using ${provider}...`);
    
    try {
      let walletAddress = '';
      let publicKey = '';
      
      // Use the appropriate provider for the wallet type
      switch (walletType) {
        case 'ETH':
        case 'USDT': // ERC-20 tokens use Ethereum wallet
          if (!window.ethereum) {
            throw new Error('MetaMask or another Ethereum wallet is not installed');
          }
          
          // Request accounts from MetaMask
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          walletAddress = accounts[0];
          
          // Get the chain ID to ensure we're on the right network
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          console.log(`Connected to Ethereum chain with ID: ${chainId}`);
          
          break;
          
        case 'SOL':
          if (!window.solana) {
            throw new Error('Phantom or another Solana wallet is not installed');
          }
          
          // Connect to Phantom
          const resp = await window.solana.connect();
          walletAddress = resp.publicKey.toString();
          publicKey = resp.publicKey.toString();
          
          break;
          
        case 'BTC':
          // For Bitcoin, we might use a different approach
          // For example, generating a dedicated address for each user
          // Or using a service like BitPay
          
          // Here we'll make an API call to CryptoProcessing to get a BTC address
          const btcAddressResp = await this.cryptoProcessingApiCall('/addresses/create', {
            currency: 'BTC',
            label: `User-${Date.now()}` // A unique label for this user
          });
          
          if (typeof btcAddressResp.address !== 'string') {
            throw new Error('Invalid BTC address response');
          }
          
          walletAddress = btcAddressResp.address;
          break;
          
        // Add cases for other cryptocurrencies
        default:
          throw new Error(`Unsupported cryptocurrency: ${walletType}`);
      }
      
      if (!walletAddress) {
        throw new Error(`Failed to obtain wallet address for ${walletType}`);
      }
      
      // Register this wallet with CryptoProcessing API
      await this.registerWalletWithCryptoProcessing(walletType, walletAddress);
      
      // Store the connected wallet
      const walletConnection: WalletConnection = {
        walletType,
        address: walletAddress,
        provider,
        connected: true,
        publicKey: publicKey || undefined
      };
      
      this.connectedWallets.set(walletType, walletConnection);
      
      return walletConnection;
    } catch (error) {
      console.error(`Failed to connect ${walletType} wallet:`, error);
      throw error;
    }
  }
  
  /**
   * Register a wallet address with CryptoProcessing API
   * @param walletType Cryptocurrency type
   * @param walletAddress Wallet address
   */
  private async registerWalletWithCryptoProcessing(walletType: string, walletAddress: string): Promise<void> {
    try {
      await this.cryptoProcessingApiCall('/wallets/register', {
        currency: walletType,
        address: walletAddress,
        merchant_id: this.apiCredentials.merchantId
      });
      
      console.log(`Registered ${walletType} wallet with CryptoProcessing API`);
    } catch (error) {
      console.error(`Failed to register wallet with CryptoProcessing:`, error);
      throw error;
    }
  }
  
  /**
   * Disconnect a wallet
   * @param walletType The cryptocurrency type to disconnect
   */
  disconnectWallet(walletType: string): void {
    const wallet = this.connectedWallets.get(walletType);
    if (wallet) {
      this.connectedWallets.delete(walletType);
      console.log(`Disconnected ${walletType} wallet`);
      
      // Notify any subscribers about the disconnection
      // (In a real implementation, you might use an event emitter here)
    }
  }
  
  /**
   * Process a donation from the connected wallet to a campaign
   * @param paymentRequest The payment information
   * @returns Payment response with transaction ID
   */
  async processDonation(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    console.log(`Processing ${paymentRequest.amount} ${paymentRequest.currency} donation for campaign ${paymentRequest.campaignId}`);
    
    // Check if the wallet for this currency is connected
    const wallet = this.connectedWallets.get(paymentRequest.currency);
    if (!wallet || !wallet.connected) {
      throw new Error(`No connected wallet for ${paymentRequest.currency}`);
    }
    
    try {
      // Create a payment invoice with CryptoProcessing API
      const invoiceResponse = await this.cryptoProcessingApiCall('/invoices/create', {
        merchant_id: this.apiCredentials.merchantId,
        price_amount: paymentRequest.amount,
        price_currency: paymentRequest.currency,
        pay_currency: paymentRequest.currency,
        order_id: `donation-${paymentRequest.campaignId}-${Date.now()}`,
        order_description: `Donation to campaign ${paymentRequest.campaignId}`,
        success_redirect_url: window.location.href,
        fail_redirect_url: window.location.href,
        metadata: {
          campaign_id: paymentRequest.campaignId,
          donor_message: paymentRequest.message || '',
          donor_id: paymentRequest.donorId || ''
        }
      });
      
      // Extract and validate payment details from the invoice response
      if (typeof invoiceResponse.invoice_id !== 'string') {
        throw new ApiError('Invalid invoice ID received from API');
      }
      const invoiceId = invoiceResponse.invoice_id;
      
      // Ensure paymentAddress is a string
      if (typeof invoiceResponse.pay_address !== 'string') {
        throw new ApiError('Invalid payment address received from API');
      }
      const paymentAddress: string = invoiceResponse.pay_address;
      
      // Initiate the payment from the user's wallet
      let transactionHash = '';
      
      switch (paymentRequest.currency) {
        case 'ETH':
        case 'USDT':
          // For Ethereum-based tokens, we use web3
          transactionHash = await this.sendEthereumPayment(
            paymentRequest.walletAddress,
            paymentAddress,
            paymentRequest.amount,
            paymentRequest.currency
          );
          break;
          
        case 'SOL':
          // For Solana
          transactionHash = await this.sendSolanaPayment(
            paymentRequest.walletAddress, 
            paymentAddress, 
            paymentRequest.amount
          );
          break;
          
        case 'BTC':
          // For Bitcoin, we might show a QR code or payment address
          // Here we're assuming the user has already sent the payment
          // We'd check the status with the API
          transactionHash = await this.checkBitcoinPayment(invoiceId);
          break;
          
        default:
          throw new Error(`Payment processing not implemented for ${paymentRequest.currency}`);
      }
      
      // Check payment status with CryptoProcessing
      const paymentStatus = await this.checkPaymentStatus(invoiceId);
      
      // Construct the payment response
      const paymentResponse: PaymentResponse = {
        transactionId: invoiceId,
        status: paymentStatus.status === 'confirmed' ? 'completed' : 'pending',
        walletAddress: wallet.address,
        campaignId: paymentRequest.campaignId,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        timestamp: new Date(),
        blockchainTxId: transactionHash
      };
      
      return paymentResponse;
    } catch (error) {
      console.error(`Failed to process donation:`, error);
      throw error;
    }
  }
  
  /**
   * Send an Ethereum payment
   * @param fromAddress Sender's address
   * @param toAddress Recipient's address
   * @param amount Amount to send
   * @param currency Currency (ETH or ERC-20 token)
   * @returns Transaction hash
   */
  private async sendEthereumPayment(
    fromAddress: string, 
    toAddress: string, 
    amount: number,
    currency: string
  ): Promise<string> {
    if (!window.ethereum) {
      throw new Error('Ethereum wallet not available');
    }
    
    // For ETH, send a direct transaction
    if (currency === 'ETH') {
      const provider = this.walletProviders.get('ETH');
      if (!provider) {
        throw new Error('Ethereum provider not initialized');
      }
      
      // Check if it's the expected provider type
      if ('request' in provider) {
        const ethProvider = provider as EthereumProvider;
        const txParams = {
          from: fromAddress,
          to: toAddress,
          value: `0x${Math.floor(amount * 1e18).toString(16)}`, // Convert ETH to wei
          gas: '0x5208', // 21000 gas
        };
        
        try {
          const txHash = await ethProvider.request({
            method: 'eth_sendTransaction',
            params: [txParams],
          });
          
          return txHash as string;
        } catch (error) {
          console.error('Error sending Ethereum transaction:', error);
          throw error;
        }
      } else {
        throw new Error('Invalid Ethereum provider type');
      }
    } 
    // For ERC-20 tokens, we need to use the token contract
    else {
      // This would require importing a library like ethers.js
      // to interact with ERC-20 tokens
      throw new Error('ERC-20 token transfers require ethers.js integration');
    }
  }
  
  /**
   * Send a Solana payment
   * @param fromAddress Sender's address
   * @param toAddress Recipient's address
   * @param amount Amount to send
   * @returns Transaction hash
   */
  private async sendSolanaPayment(
    fromAddress: string, 
    toAddress: string, 
    amount: number
  ): Promise<string> {
    if (!window.solana) {
      throw new Error('Solana wallet not available');
    }
    
    try {
      // Convert amount to lamports (SOL smallest unit)
      const lamports = amount * 1000000000;
      
      // Create the transaction (would normally use @solana/web3.js)
      // This is a simplified example
      const transaction = {
        feePayer: fromAddress,
        instructions: [{
          programId: 'System',
          data: {
            amount: lamports,
          },
          accounts: [
            { pubkey: fromAddress, isSigner: true, isWritable: true },
            { pubkey: toAddress, isSigner: false, isWritable: true },
          ],
        }],
      };
      
      // Get the Solana provider
      const provider = this.walletProviders.get('SOL');
      if (!provider) {
        throw new Error('Solana provider not initialized');
      }
      
      // Verify it's the correct provider type
      if ('signTransaction' in provider && 'sendRawTransaction' in provider) {
        const solProvider = provider as SolanaProvider;
        
        // Sign and send the transaction
        const signedTransaction = await solProvider.signTransaction(transaction);
        const signature = await solProvider.sendRawTransaction(signedTransaction.serialize());
        
        return signature;
      } else {
        throw new Error('Invalid Solana provider type');
      }
    } catch (error) {
      console.error('Error sending Solana transaction:', error);
      throw error;
    }
  }
  
  /**
   * Check a Bitcoin payment status
   * @param invoiceId CryptoProcessing invoice ID
   * @returns Transaction hash when confirmed
   */
  private async checkBitcoinPayment(invoiceId: string): Promise<string> {
    try {
      // Check the invoice status with CryptoProcessing
      const response = await this.cryptoProcessingApiCall(`/invoices/${invoiceId}`, {});
      
      if (response.status !== 'confirmed') {
        throw new Error('Bitcoin payment not yet confirmed');
      }
      
      // Ensure transactions array exists and has at least one entry
      if (!response.transactions || !Array.isArray(response.transactions) || response.transactions.length === 0) {
        throw new Error('No transaction hash found in response');
      }
      
      // Ensure the hash property exists and is a string
      const hash = response.transactions[0]?.hash;
      if (typeof hash !== 'string') {
        throw new Error('Invalid transaction hash in response');
      }
      
      return hash;
    } catch (error) {
      console.error('Error checking Bitcoin payment:', error);
      throw error;
    }
  }
  
  /**
   * Check payment status with CryptoProcessing
   * @param invoiceId CryptoProcessing invoice ID
   * @returns Payment status information
   */
  private async checkPaymentStatus(invoiceId: string): Promise<PaymentStatusResponse> {
    try {
      const response = await this.cryptoProcessingApiCall(`/invoices/${invoiceId}`, {});
      return response as PaymentStatusResponse;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  }
  
  /**
   * Check if a wallet is connected for a specific cryptocurrency
   * @param currency The cryptocurrency to check (ETH, BTC, etc)
   * @returns True if wallet is connected
   */
  isWalletConnected(currency: string): boolean {
    const wallet = this.connectedWallets.get(currency);
    return !!wallet && wallet.connected;
  }
  
  /**
   * Get all connected wallets
   * @returns Array of connected wallet information
   */
  getConnectedWallets(): WalletConnection[] {
    return Array.from(this.connectedWallets.values());
  }
  
  /**
   * Make API call to CryptoProcessing API
   * @param endpoint API endpoint
   * @param data Request data
   * @returns API response
   */
  private async cryptoProcessingApiCall(
    endpoint: string, 
    data: Record<string, unknown>
  ): Promise<ApiResponse> {
    try {
      // Use our proxy API route instead of calling the CryptoProcessing API directly
      const response = await fetch('/api/crypto-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint,
          data
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }
      
      return await response.json() as ApiResponse;
    } catch (error) {
      console.error('CryptoProcessing API call failed:', error);
      throw error;
    }
  }
}

// Declare global window types for wallet providers
declare global {
  interface Window {
    ethereum?: EthereumProvider;
    solana?: SolanaProvider;
  }
}

// Export the singleton instance
export const cryptoPaymentProcessor = CryptoPaymentProcessor.getInstance();

// Export types
export type { WalletConnection, PaymentRequest, PaymentResponse }; 
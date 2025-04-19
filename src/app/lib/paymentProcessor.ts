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

// Create a singleton class for managing cryptocurrency payments
class CryptoPaymentProcessor {
  private static instance: CryptoPaymentProcessor;
  private apiCredentials: ApiCredentials = {
    apiKey: process.env.NEXT_PUBLIC_CRYPTO_PROCESSING_API_KEY || '',
    merchantId: process.env.NEXT_PUBLIC_CRYPTO_PROCESSING_STORE_ID || ''
  };
  private apiEndpoint: string = 'https://api.cryptoprocessing.io/api/v1';
  private connectedWallets: Map<string, WalletConnection> = new Map();
  private walletProviders: Map<string, any> = new Map();

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
      
      // Extract payment details from the invoice response
      const invoiceId = invoiceResponse.invoice_id;
      const paymentAddress = invoiceResponse.pay_address;
      
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
      const txParams = {
        from: fromAddress,
        to: toAddress,
        value: `0x${Math.floor(amount * 1e18).toString(16)}`, // Convert ETH to wei
        gas: '0x5208', // 21000 gas
      };
      
      try {
        const txHash = await provider.request({
          method: 'eth_sendTransaction',
          params: [txParams],
        });
        
        return txHash;
      } catch (error) {
        console.error('Error sending Ethereum transaction:', error);
        throw error;
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
      
      // Sign and send the transaction
      const signedTransaction = await window.solana.signTransaction(transaction);
      const signature = await window.solana.sendRawTransaction(signedTransaction.serialize());
      
      return signature;
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
      
      return response.transactions[0].hash;
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
  private async checkPaymentStatus(invoiceId: string): Promise<any> {
    try {
      const response = await this.cryptoProcessingApiCall(`/invoices/${invoiceId}`, {});
      return response;
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
  ): Promise<Record<string, any>> {
    try {
      // For endpoints that don't need authentication
      const isPublicEndpoint = endpoint.startsWith('/public/');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      // Add API key for authenticated endpoints
      if (!isPublicEndpoint) {
        headers['Authorization'] = `Bearer ${this.apiCredentials.apiKey}`;
      }
      
      const response = await fetch(`${this.apiEndpoint}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('CryptoProcessing API call failed:', error);
      throw error;
    }
  }
}

// Declare global window types for wallet providers
declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
  }
}

// Export the singleton instance
export const cryptoPaymentProcessor = CryptoPaymentProcessor.getInstance();

// Export types
export type { WalletConnection, PaymentRequest, PaymentResponse }; 
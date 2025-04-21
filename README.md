This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# CryptoFund - Cryptocurrency Donation Platform

A decentralized crowdfunding platform that enables crypto donations to various campaigns and causes.

## Features

- Multi-cryptocurrency support (ETH, BTC, USDT, SOL, DOT, ADA)
- Campaign creation and management
- Secure wallet connections
- Real-time donation tracking
- User authentication via NextAuth

## Technology Stack

- Next.js 14 with App Router
- TypeScript
- Material UI
- NextAuth.js for authentication
- Prisma for database access
- CryptoProcessing API for cryptocurrency transactions

## Production Setup

### Environment Variables

Create a `.env` file in the root of your project with the following variables:

```
# Database
DATABASE_URL="postgresql://username:password@hostname:port/dbname"

# NextAuth
NEXTAUTH_URL=https://your-production-domain.com
NEXTAUTH_SECRET=your-nextauth-secret-key

# Authentication Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
APPLE_CLIENT_ID=your-apple-client-id
APPLE_CLIENT_SECRET=your-apple-client-secret

# CryptoProcessing API
CRYPTOPROCESSING_API_KEY=your-cryptoprocessing-api-key
NEXT_PUBLIC_CRYPTO_PROCESSING_STORE_ID=your-merchant-id
```

### Database Setup

1. **Prepare your PostgreSQL database**:

   ```bash
   # Create a new database
   psql -c "CREATE DATABASE crypto_fund_me"
   ```

2. **Run database migrations for production**:

   ```bash
   npx prisma migrate deploy
   ```

3. **Seed initial data (if needed)**:

   ```bash
   npx prisma db seed
   ```

### CORS Configuration

Ensure your server is configured to handle CORS correctly. For Apache, add to your `.htaccess`:

```
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>
```

For Nginx:

```
location / {
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization';
    
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization';
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain charset=UTF-8';
        add_header 'Content-Length' 0;
        return 204;
    }
}
```

### Build and Deploy

1. **Build the application**:

   ```bash
   npm run build
   ```

2. **Start the production server**:

   ```bash
   npm start
   ```

### CryptoProcessing API Configuration

1. Sign up for a [CryptoProcessing](https://cryptoprocessing.io/) account
2. Create an API key and note your merchant ID
3. Configure the callback URL in your CryptoProcessing dashboard to point to:
   ```
   https://your-production-domain.com/api/donations/callback
   ```

### Security Considerations

- Ensure your server uses HTTPS
- Store API keys securely in environment variables
- Implement rate limiting on API routes
- Consider implementing IP filtering for admin endpoints
- Regularly update dependencies

## Troubleshooting

### CORS Issues

If you're experiencing CORS errors with the CryptoProcessing API:

1. Verify your API key is correct
2. Check that your domain is whitelisted in the CryptoProcessing dashboard
3. Ensure the proxy API route (`/api/crypto-proxy`) is working correctly

### Wallet Connection Issues

If users can't connect their wallets:

1. Verify browser extension compatibility
2. Check for console errors related to wallet providers
3. Ensure wallet providers are properly initializing on the client side

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Solana Smart Contract

The project includes a Solana smart contract built with Anchor framework. The contract handles:

1. Campaign creation and management
2. Donation collection and tracking
3. Automatic refunds if goals aren't met
4. Currency conversion when goals are met

### Building and Deploying the Contract

To build the Solana smart contract:

```bash
npm run solana:build
```

To deploy the contract to Solana devnet:

```bash
npm run solana:deploy
```

You'll need the Solana CLI and Anchor installed on your system. Make sure you have a funded Solana wallet configured at `~/.config/solana/id.json`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

To learn more about Solana development:

- [Solana Documentation](https://docs.solana.com/) - Official Solana docs
- [Anchor Framework](https://www.anchor-lang.com/) - Framework for building Solana programs
- [Jupiter Aggregator](https://jup.ag/) - DEX aggregator for optimal token swaps

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

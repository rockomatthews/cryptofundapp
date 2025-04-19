This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# CryptoFund - Decentralized Crowdfunding Platform

A blockchain-powered crowdfunding platform that allows users to create campaigns and receive funding in various cryptocurrencies. The platform uses smart contracts to ensure that funds are only released to creators when funding goals are met, otherwise they are returned to donors.

## Features

- **Multi-Currency Donations**: Accept donations in various cryptocurrencies
- **Goal-Based Funding**: Funds are only released to creators when the USD-equivalent goal is met
- **Automatic Currency Conversion**: Converts all donated currencies to the creator's preferred currency
- **Solana Smart Contracts**: Utilizes Solana for low transaction fees and fast settlement

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

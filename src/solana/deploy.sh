#!/bin/bash
set -e

echo "Deploying Solana program..."
echo "Warning: This will deploy to mainnet-beta and cost real SOL"
read -p "Are you sure you want to continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
fi

# Make sure we're on mainnet
solana config set --url mainnet-beta

# Check SOL balance
BALANCE=$(solana balance)
echo "Your SOL balance is: $BALANCE"
echo "Program deployment may cost 2-3 SOL"
read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
fi

# Deploy the program
echo "Deploying program with ID: 8tPzm9ZtpPURBFGNXzFGJAPe2Q7JFMRu9YtEQTywCE2b"
solana program deploy --program-id crypto-fund-me-keypair.json target/deploy/crypto_fund_me.so

echo "Program deployment initiated. Check the status with:"
echo "solana program show 8tPzm9ZtpPURBFGNXzFGJAPe2Q7JFMRu9YtEQTywCE2b" 
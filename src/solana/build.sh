#!/bin/bash
set -e

echo "Building Solana program..."
cd programs/crypto-fund-me/
cargo build-bpf

echo "Program built successfully" 
#!/usr/bin/env bash
set -euo pipefail

RPC_URL="${1:-https://forno.celo-sepolia.celo-testnet.org}"
EXPECTED_CHAIN_ID="${2:-11142220}"

chain_hex=$(curl -sS -X POST "$RPC_URL" \
  -H 'content-type: application/json' \
  --data '{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}' \
  | sed -n 's/.*"result":"\([^"]*\)".*/\1/p')

if [[ -z "$chain_hex" ]]; then
  echo "RPC check failed: empty eth_chainId response from $RPC_URL" >&2
  exit 1
fi

chain_dec=$((chain_hex))

if [[ "$chain_dec" != "$EXPECTED_CHAIN_ID" ]]; then
  echo "RPC check failed: expected chain id $EXPECTED_CHAIN_ID, got $chain_dec ($chain_hex)" >&2
  exit 1
fi

block_hex=$(curl -sS -X POST "$RPC_URL" \
  -H 'content-type: application/json' \
  --data '{"jsonrpc":"2.0","id":2,"method":"eth_blockNumber","params":[]}' \
  | sed -n 's/.*"result":"\([^"]*\)".*/\1/p')

block_dec=$((block_hex))

echo "Celo Sepolia RPC OK: chainId=$chain_dec block=$block_dec rpc=$RPC_URL"

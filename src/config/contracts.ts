import type { Address } from 'viem';
import { CHAIN_IDS } from './chains';

export interface ContractAddresses {
  predictionMarket: Address;
  dealerNFT: Address;
  oracleResolver: Address;
  usdc: Address;
}

const ZERO: Address = '0x0000000000000000000000000000000000000000';

// Default addresses per chain (well-known USDC addresses, zero for contracts)
const defaultAddresses: Record<number, ContractAddresses> = {
  [CHAIN_IDS.SEPOLIA]: { predictionMarket: ZERO, dealerNFT: ZERO, oracleResolver: ZERO, usdc: ZERO },
  [CHAIN_IDS.MAINNET]: { predictionMarket: ZERO, dealerNFT: ZERO, oracleResolver: ZERO, usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Address },
  [CHAIN_IDS.POLYGON]: { predictionMarket: ZERO, dealerNFT: ZERO, oracleResolver: ZERO, usdc: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359' as Address },
  [CHAIN_IDS.ARBITRUM]: { predictionMarket: ZERO, dealerNFT: ZERO, oracleResolver: ZERO, usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' as Address },
  [CHAIN_IDS.OPTIMISM]: { predictionMarket: ZERO, dealerNFT: ZERO, oracleResolver: ZERO, usdc: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85' as Address },
};

let _overrides: Partial<Record<number, Partial<ContractAddresses>>> = {};

/**
 * Set contract address overrides. Called by consuming apps to configure
 * contract addresses (typically from env vars).
 */
export function setContractAddresses(
  chainId: number,
  addresses: Partial<ContractAddresses>
): void {
  _overrides[chainId] = { ..._overrides[chainId], ...addresses };
}

export function getContractAddresses(chainId: number): ContractAddresses | undefined {
  const defaults = defaultAddresses[chainId];
  const overrides = _overrides[chainId];
  if (!defaults && !overrides) return undefined;
  return { ...(defaults || { predictionMarket: ZERO, dealerNFT: ZERO, oracleResolver: ZERO, usdc: ZERO }), ...overrides };
}

export function getContractAddress(
  chainId: number,
  contract: keyof ContractAddresses
): Address | undefined {
  return getContractAddresses(chainId)?.[contract];
}

import { mainnet, sepolia, polygon, arbitrum, optimism } from "viem/chains";

// Supported chains for the prediction market
export const supportedChains = [
  mainnet,
  sepolia,
  polygon,
  arbitrum,
  optimism,
] as const;

// Default chain (Sepolia for testing)
export const defaultChain = sepolia;

// Chain IDs for quick reference
export const CHAIN_IDS = {
  MAINNET: mainnet.id,
  SEPOLIA: sepolia.id,
  POLYGON: polygon.id,
  ARBITRUM: arbitrum.id,
  OPTIMISM: optimism.id,
} as const;

// Get chain by ID
export function getChainById(chainId: number) {
  return supportedChains.find((chain) => chain.id === chainId);
}

// Check if chain is supported
export function isSupportedChain(chainId: number): boolean {
  return supportedChains.some((chain) => chain.id === chainId);
}

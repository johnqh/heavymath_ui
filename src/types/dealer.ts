/**
 * @fileoverview Dealer type definitions
 * @description Types for Dealer NFTs, permissions, and dashboard data.
 * Dealers are users who hold special NFTs that grant permission to create and manage prediction markets.
 */

import type { Address } from 'viem';

/**
 * Represents a Dealer NFT and its current ownership status.
 */
export interface DealerNFT {
  /** The NFT token ID */
  tokenId: bigint;
  /** Current owner's wallet address */
  owner: Address;
  /** Whether the NFT has any granted permissions */
  hasPermissions: boolean;
}

/**
 * Permission granted to a Dealer NFT for a specific category/subcategory combination.
 * Determines which types of markets the dealer can create.
 */
export interface DealerPermission {
  /** The NFT token ID this permission belongs to */
  tokenId: bigint;
  /** Category number (0xFF = wildcard for all categories) */
  category: number;
  /** Allowed subcategory numbers (0xFF in array = wildcard for all subcategories) */
  subCategories: number[];
}

/**
 * Wildcard constant matching the smart contract.
 * When used as category or subcategory, grants permission for all values.
 */
export const PERMISSION_WILDCARD = 0xff;

/**
 * Check if a dealer permission allows creating markets in a given category/subcategory.
 *
 * @param permission - The dealer permission to check
 * @param category - The target category number
 * @param subCategory - The target subcategory number
 * @returns True if the permission grants access to the specified category/subcategory
 */
export function hasPermission(
  permission: DealerPermission,
  category: number,
  subCategory: number
): boolean {
  // Check category match (or wildcard)
  if (permission.category !== PERMISSION_WILDCARD && permission.category !== category) {
    return false;
  }

  // Check subcategory match (or wildcard)
  if (permission.subCategories.includes(PERMISSION_WILDCARD)) {
    return true;
  }

  return permission.subCategories.includes(subCategory);
}

/**
 * Aggregated dashboard data for a dealer, including their NFTs, permissions, and market statistics.
 */
export interface DealerDashboard {
  /** All Dealer NFTs owned by the wallet */
  nfts: DealerNFT[];
  /** All permissions across owned NFTs */
  permissions: DealerPermission[];
  /** Number of currently active markets */
  activeMarkets: number;
  /** Total USDC volume across all markets */
  totalVolume: bigint;
  /** Total fees earned across all markets */
  totalFees: bigint;
}

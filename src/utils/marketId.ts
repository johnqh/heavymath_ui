import { parseChainPrefixedId } from '@sudobility/heavymath_types';

/**
 * Extract the on-chain numeric market ID from a chain-prefixed ID string.
 *
 * Chain-prefixed IDs have the format `"{chainId}-{identifier}"` (e.g. `"11155111-2"`).
 * Smart contract calls require just the numeric identifier portion as a bigint.
 */
export function getOnChainMarketId(chainPrefixedId: string): bigint {
  const { identifier } = parseChainPrefixedId(chainPrefixedId as `${number}-${string}`);
  return BigInt(identifier);
}

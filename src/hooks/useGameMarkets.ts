/**
 * @fileoverview Hook to fetch markets associated with a specific game
 * @description Fetches SPORTS category markets from the indexer and filters
 * client-side by oracleId encoding. This is a temporary approach until
 * the indexer supports oracleId filtering in MarketFilters.
 */

import { useQuery } from '@tanstack/react-query';
import type { IndexerClient } from '@heavymath/indexer_client';
import { encodeOracleId, isValidSportsOracleId } from '../utils/oracleId';
import { CATEGORIES } from '../types/market';
import type { SportCode } from '../config/sportCodes';

/**
 * Fetch markets for a specific game, identified by sport code and game ID.
 *
 * Currently fetches all SPORTS markets and filters client-side by oracleId.
 * Will be optimized with server-side filtering when the indexer adds oracleId support.
 *
 * @param indexerClient - IndexerClient instance from useIndexer()
 * @param sportCode - Numeric sport code
 * @param gameId - Game/fixture ID from the sports API
 * @param options - Optional TanStack Query options
 */
export function useGameMarkets(
  indexerClient: IndexerClient,
  sportCode: SportCode,
  gameId: number | undefined,
  options?: { enabled?: boolean }
) {
  const targetOracleId =
    gameId !== undefined ? encodeOracleId(sportCode, gameId) : undefined;

  return useQuery({
    queryKey: ['gameMarkets', sportCode, gameId],
    queryFn: async () => {
      const response = await indexerClient.getMarkets({
        category: CATEGORIES.SPORTS,
        limit: 100,
      });

      const markets = response.data ?? [];

      if (!targetOracleId) return [];

      return markets.filter(market => {
        if (!market.oracleId) return false;
        try {
          const normalized = market.oracleId.toLowerCase();
          return (
            normalized === targetOracleId.toLowerCase() &&
            isValidSportsOracleId(market.oracleId as `0x${string}`)
          );
        } catch {
          return false;
        }
      });
    },
    enabled: (options?.enabled ?? true) && gameId !== undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

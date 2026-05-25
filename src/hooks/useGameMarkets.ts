/**
 * @fileoverview Hook to fetch markets associated with a specific game
 * @description Fetches markets by oracleId using server-side filtering.
 */

import { useQuery } from '@tanstack/react-query';
import type { IndexerClient } from '@heavymath/indexer_client';
import { encodeOracleId } from '../utils/oracleId';
import { CATEGORIES } from '../types/market';
import type { SportCode } from '../config/sportCodes';

/**
 * Fetch markets for a specific game, identified by sport code and game ID.
 * Uses server-side oracle_id filtering for efficient querying.
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
      if (!targetOracleId) return [];

      const response = await indexerClient.getMarkets({
        category: CATEGORIES.SPORTS,
        oracleId: targetOracleId,
        limit: 100,
      });

      return response.data ?? [];
    },
    enabled: (options?.enabled ?? true) && gameId !== undefined,
    staleTime: 5 * 60 * 1000,
  });
}

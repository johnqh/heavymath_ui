/**
 * @fileoverview Hook to fetch markets associated with a specific league/tournament
 * @description Fetches SPORTS category markets from the indexer and filters
 * client-side by oracleId encoding. Same approach as useGameMarkets.
 */

import { useQuery } from '@tanstack/react-query';
import type { IndexerClient } from '@heavymath/indexer_client';
import { encodeOracleId, isValidSportsOracleId } from '../utils/oracleId';
import { CATEGORIES } from '../types/market';
import type { SportCode } from '../config/sportCodes';

export function useLeagueMarkets(
  indexerClient: IndexerClient,
  sportCode: SportCode,
  leagueId: number | undefined,
  options?: { enabled?: boolean }
) {
  const targetOracleId =
    leagueId !== undefined ? encodeOracleId(sportCode, leagueId) : undefined;

  return useQuery({
    queryKey: ['leagueMarkets', sportCode, leagueId],
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
    enabled: (options?.enabled ?? true) && leagueId !== undefined,
    staleTime: 5 * 60 * 1000,
  });
}

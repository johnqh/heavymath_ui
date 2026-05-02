/**
 * @fileoverview Hook to get game IDs that have associated prediction markets
 * @description Fetches all SPORTS category markets from the indexer, decodes
 * their oracleIds, and returns a set of game IDs for a given sport.
 * Used by the bettor mode to filter sports hierarchy pages.
 */

import { useQuery } from "@tanstack/react-query";
import type { IndexerClient } from "@heavymath/indexer_client";
import { decodeOracleId, isValidSportsOracleId } from "../utils/oracleId";
import { CATEGORIES } from "../types/market";
import type { SportCode } from "../config/sportCodes";

/**
 * Fetch game IDs that have associated prediction markets for a given sport.
 *
 * @param indexerClient - IndexerClient instance
 * @param sportCode - Numeric sport code to filter by
 * @returns Set of game IDs with markets, plus loading state
 */
export function useGameIdsWithMarkets(
  indexerClient: IndexerClient,
  sportCode: SportCode,
) {
  const { data, isLoading } = useQuery({
    queryKey: ["gameIdsWithMarkets", sportCode],
    queryFn: async () => {
      const response = await indexerClient.getMarkets({
        category: CATEGORIES.SPORTS,
        limit: 500,
      });

      const markets = response.data ?? [];
      const gameIds = new Set<number>();

      for (const market of markets) {
        if (!market.oracleId) continue;
        try {
          const hex = market.oracleId as `0x${string}`;
          if (!isValidSportsOracleId(hex)) continue;
          const { sportCode: sc, gameId } = decodeOracleId(hex);
          if (sc === sportCode) {
            gameIds.add(gameId);
          }
        } catch {
          // Skip invalid oracleIds
        }
      }

      return gameIds;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    gameIds: data ?? new Set<number>(),
    isLoading,
  };
}

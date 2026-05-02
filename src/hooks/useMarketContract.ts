import { useMemo } from "react";
import { usePublicClient, useConfig } from "wagmi";
import { getPublicClient, getWalletClient, switchChain } from "wagmi/actions";
import type { Config } from "wagmi";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { EVMPredictionClient } from "../lib/evmClient";
import type { Address } from "viem";
import { getContractAddress } from "../config/contracts";
import { getAppConfig } from "../config/app";

/**
 * Invalidate query keys immediately and again after delays to account for
 * indexer processing time. The on-chain tx confirms before the indexer
 * picks up the event, so the first refetch often returns stale data.
 */
function invalidateWithRetry(queryClient: QueryClient, queryKeys: string[][]) {
  const invalidate = () => {
    for (const queryKey of queryKeys) {
      queryClient.invalidateQueries({ queryKey });
    }
  };
  const delays = [0, 5_000, 12_000, 20_000, 30_000];
  for (const delay of delays) {
    if (delay === 0) {
      invalidate();
    } else {
      setTimeout(invalidate, delay);
    }
  }
}

/**
 * @fileoverview Contract interaction hooks
 * @description React hooks that wrap EVMPredictionClient operations with wagmi wallet state.
 * Each hook manages its own wallet/public client references via wagmi hooks and
 * delegates to a singleton EVMPredictionClient per chain.
 */

/** Singleton EVMPredictionClient cache keyed by chain ID */
const clientCache = new Map<number, EVMPredictionClient>();

/**
 * Get or create a singleton EVMPredictionClient for the given chain.
 *
 * @param chainId - The EVM chain ID
 * @returns The client instance, or null if contracts are not deployed on this chain
 */
function getClient(chainId: number): EVMPredictionClient | null {
  const cached = clientCache.get(chainId);
  if (cached) return cached;

  const predictionMarket = getContractAddress(chainId, "predictionMarket");
  const usdc = getContractAddress(chainId, "usdc");

  if (
    !predictionMarket ||
    predictionMarket === "0x0000000000000000000000000000000000000000"
  ) {
    return null;
  }

  const client = new EVMPredictionClient({
    predictionMarket,
    stakeToken: usdc,
  });

  clientCache.set(chainId, client);
  return client;
}

/**
 * Get wallet and public clients, auto-switching chain if needed.
 */
async function getClients(config: Config, chainId: number) {
  const walletClient = await getWalletClient(config);
  if (walletClient.chain?.id !== chainId) {
    await switchChain(config, { chainId });
  }
  return {
    walletClient: await getWalletClient(config),
    publicClient: getPublicClient(config, { chainId }),
  };
}

/**
 * Hook to get the EVM prediction client for the current chain.
 *
 * @returns The EVMPredictionClient for the current chain, or null if contracts are unavailable
 */
export function useEVMClient() {
  const chainId = getAppConfig().defaultChainId;

  return useMemo(() => {
    if (!chainId) return null;
    return getClient(chainId);
  }, [chainId]);
}

/**
 * Hook to place a prediction on a market.
 * Auto-handles USDC allowance approval before the prediction transaction.
 *
 * @returns TanStack mutation for placing predictions
 */
export function usePlacePrediction() {
  const config = useConfig();
  const chainId = getAppConfig().defaultChainId;
  const client = useEVMClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      marketId,
      percentage,
      amount,
    }: {
      marketId: bigint;
      percentage: number;
      amount: bigint;
    }) => {
      const { walletClient, publicClient } = await getClients(config, chainId);

      if (!client || !walletClient || !publicClient) {
        throw new Error("Client not available");
      }

      const result = await client.placePrediction(
        {
          walletClient,
          publicClient,
          chain: publicClient.chain,
        },
        marketId,
        percentage,
        amount,
      );

      return result;
    },
    onSuccess: () => {
      invalidateWithRetry(queryClient, [
        ["heavymath", "markets"],
        ["heavymath", "market"],
        ["heavymath", "market-predictions"],
        ["heavymath", "predictions"],
      ]);
    },
    meta: {
      chainId,
    },
  });
}

/**
 * Hook to update an existing prediction on a market.
 * Auto-handles USDC allowance approval for additional stake amounts.
 *
 * @returns TanStack mutation for updating predictions
 */
export function useUpdatePrediction() {
  const config = useConfig();
  const chainId = getAppConfig().defaultChainId;
  const client = useEVMClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      marketId,
      newPercentage,
      additionalAmount,
    }: {
      marketId: bigint;
      newPercentage: number;
      additionalAmount: bigint;
    }) => {
      const { walletClient, publicClient } = await getClients(config, chainId);

      if (!client || !walletClient || !publicClient) {
        throw new Error("Client not available");
      }

      const result = await client.updatePrediction(
        {
          walletClient,
          publicClient,
          chain: publicClient.chain,
        },
        marketId,
        newPercentage,
        additionalAmount,
      );

      return result;
    },
    onSuccess: () => {
      invalidateWithRetry(queryClient, [
        ["heavymath", "markets"],
        ["heavymath", "market"],
        ["heavymath", "market-predictions"],
        ["heavymath", "predictions"],
      ]);
    },
    meta: {
      chainId,
    },
  });
}

/**
 * Hook to withdraw a prediction from a market (before deadline).
 *
 * @returns TanStack mutation for withdrawing predictions
 */
export function useWithdrawPrediction() {
  const config = useConfig();
  const chainId = getAppConfig().defaultChainId;
  const client = useEVMClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ marketId }: { marketId: bigint }) => {
      const { walletClient, publicClient } = await getClients(config, chainId);

      if (!client || !walletClient || !publicClient) {
        throw new Error("Client not available");
      }

      const result = await client.withdrawPrediction(
        {
          walletClient,
          publicClient,
          chain: publicClient.chain,
        },
        marketId,
      );

      return result;
    },
    onSuccess: () => {
      invalidateWithRetry(queryClient, [
        ["heavymath", "markets"],
        ["heavymath", "market"],
        ["heavymath", "market-predictions"],
        ["heavymath", "predictions"],
      ]);
    },
    meta: {
      chainId,
    },
  });
}

/**
 * Hook to claim winnings from a resolved market.
 *
 * @returns TanStack mutation for claiming winnings
 */
export function useClaimWinnings() {
  const config = useConfig();
  const chainId = getAppConfig().defaultChainId;
  const client = useEVMClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ marketId }: { marketId: bigint }) => {
      const { walletClient, publicClient } = await getClients(config, chainId);

      if (!client || !walletClient || !publicClient) {
        throw new Error("Client not available");
      }

      const result = await client.claimWinnings(
        {
          walletClient,
          publicClient,
          chain: publicClient.chain,
        },
        marketId,
      );

      return result;
    },
    onSuccess: () => {
      invalidateWithRetry(queryClient, [
        ["heavymath", "predictions"],
        ["heavymath", "market"],
        ["heavymath", "withdrawals"],
      ]);
    },
    meta: {
      chainId,
    },
  });
}

/**
 * Hook to claim a refund from a cancelled or abandoned market.
 *
 * @returns TanStack mutation for claiming refunds
 */
export function useClaimRefund() {
  const config = useConfig();
  const chainId = getAppConfig().defaultChainId;
  const client = useEVMClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ marketId }: { marketId: bigint }) => {
      const { walletClient, publicClient } = await getClients(config, chainId);

      if (!client || !walletClient || !publicClient) {
        throw new Error("Client not available");
      }

      const result = await client.claimRefund(
        {
          walletClient,
          publicClient,
          chain: publicClient.chain,
        },
        marketId,
      );

      return result;
    },
    onSuccess: () => {
      invalidateWithRetry(queryClient, [
        ["heavymath", "predictions"],
        ["heavymath", "market"],
      ]);
    },
    meta: {
      chainId,
    },
  });
}

/**
 * Hook to read on-chain market data from the smart contract.
 *
 * @param marketId - The market ID to query, or undefined to skip
 * @returns TanStack query result with market state data
 */
export function useOnChainMarket(marketId: bigint | undefined) {
  const publicClient = usePublicClient();
  const chainId = getAppConfig().defaultChainId;
  const client = useEVMClient();

  return useQuery({
    queryKey: ["onChainMarket", chainId, marketId?.toString()],
    queryFn: async () => {
      if (!client || !publicClient || marketId === undefined) {
        return null;
      }
      return client.getMarket(publicClient, marketId);
    },
    enabled: !!client && !!publicClient && marketId !== undefined,
  });
}

/**
 * Hook to read on-chain prediction data for a specific user and market.
 *
 * @param marketId - The market ID to query, or undefined to skip
 * @param account - The user's wallet address, or undefined to skip
 * @returns TanStack query result with prediction data (amount, percentage, placedAt, claimed)
 */
export function useOnChainPrediction(
  marketId: bigint | undefined,
  account: Address | undefined,
) {
  const publicClient = usePublicClient();
  const chainId = getAppConfig().defaultChainId;
  const client = useEVMClient();

  return useQuery({
    queryKey: ["onChainPrediction", chainId, marketId?.toString(), account],
    queryFn: async () => {
      if (!client || !publicClient || marketId === undefined || !account) {
        return null;
      }
      return client.getPrediction(publicClient, marketId, account);
    },
    enabled: !!client && !!publicClient && marketId !== undefined && !!account,
  });
}

/**
 * Hook to lock a market after its deadline.
 * Calculates market split and enables partial refunds for the overweight side.
 * Anyone can call this after the market deadline.
 *
 * @returns TanStack mutation for locking markets
 */
export function useLockMarket() {
  const config = useConfig();
  const chainId = getAppConfig().defaultChainId;
  const client = useEVMClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ marketId }: { marketId: bigint }) => {
      const { walletClient, publicClient } = await getClients(config, chainId);

      if (!client || !walletClient || !publicClient) {
        throw new Error("Client not available");
      }

      const result = await client.lockMarket(
        {
          walletClient,
          publicClient,
          chain: publicClient.chain,
        },
        marketId,
      );

      return result;
    },
    onSuccess: () => {
      invalidateWithRetry(queryClient, [
        ["heavymath", "markets"],
        ["heavymath", "market"],
        ["onChainMarket"],
      ]);
    },
    meta: {
      chainId,
    },
  });
}

/**
 * Hook to claim a partial refund from a locked market.
 * Available to bettors on the overweight side after market is locked.
 *
 * @returns TanStack mutation for claiming lock refunds
 */
export function useClaimLockRefund() {
  const config = useConfig();
  const chainId = getAppConfig().defaultChainId;
  const client = useEVMClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ marketId }: { marketId: bigint }) => {
      const { walletClient, publicClient } = await getClients(config, chainId);

      if (!client || !walletClient || !publicClient) {
        throw new Error("Client not available");
      }

      const result = await client.claimLockRefund(
        {
          walletClient,
          publicClient,
          chain: publicClient.chain,
        },
        marketId,
      );

      return result;
    },
    onSuccess: () => {
      invalidateWithRetry(queryClient, [
        ["heavymath", "predictions"],
        ["heavymath", "market"],
        ["onChainMarket"],
      ]);
    },
    meta: {
      chainId,
    },
  });
}

/**
 * Hook to read the lock refund amount for the current user on a market.
 *
 * @param marketId - The market ID to query, or undefined to skip
 * @param account - The user's wallet address, or undefined to skip
 * @returns TanStack query result with refund amount
 */
export function useLockRefundAmount(
  marketId: bigint | undefined,
  account: Address | undefined,
) {
  const publicClient = usePublicClient();
  const chainId = getAppConfig().defaultChainId;
  const client = useEVMClient();

  return useQuery({
    queryKey: ["lockRefundAmount", chainId, marketId?.toString(), account],
    queryFn: async () => {
      if (!client || !publicClient || marketId === undefined || !account) {
        return 0n;
      }
      return client.getLockRefundAmount(publicClient, marketId, account);
    },
    enabled: !!client && !!publicClient && marketId !== undefined && !!account,
  });
}

/**
 * Hook to read the lock split boundaries for a locked market.
 * Returns negativePercentage and positivePercentage which define the under/over boundary.
 *
 * @param marketId - The market ID to query, or undefined to skip
 * @returns TanStack query result with split boundary data
 */
export function useMarketSplit(marketId: bigint | undefined) {
  const publicClient = usePublicClient();
  const chainId = getAppConfig().defaultChainId;
  const client = useEVMClient();

  return useQuery({
    queryKey: ["marketSplit", chainId, marketId?.toString()],
    queryFn: async () => {
      if (!client || !publicClient || marketId === undefined) {
        return null;
      }
      return client.getLockRefundsSplit(publicClient, marketId);
    },
    enabled: !!client && !!publicClient && marketId !== undefined,
  });
}

/**
 * Hook to read the contract's testMode flag.
 * When true, markets can be locked/resolved without waiting for the deadline.
 *
 * @returns TanStack query result with boolean testMode value
 */
export function useTestMode() {
  const publicClient = usePublicClient();
  const chainId = getAppConfig().defaultChainId;
  const client = useEVMClient();

  return useQuery({
    queryKey: ["testMode", chainId],
    queryFn: async () => {
      if (!client || !publicClient) {
        return false;
      }
      return client.getTestMode(publicClient);
    },
    enabled: !!client && !!publicClient,
    staleTime: 60_000, // cache for 1 minute — rarely changes
  });
}

/** Minimal ABI for reading PredictionMarket.owner() (from OwnableUpgradeable) */
const OWNER_ABI = [
  {
    name: "owner",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

/**
 * Hook to read the PredictionMarket contract owner address.
 * Used to gate admin-only UI (e.g., Chainlink configuration).
 *
 * @returns TanStack query result with the owner address
 */
export function useContractOwner() {
  const config = useConfig();
  const chainId = getAppConfig().defaultChainId;
  const predictionMarketAddress = getContractAddress(
    chainId,
    "predictionMarket",
  );

  const query = useQuery({
    queryKey: ["contractOwner", chainId],
    queryFn: async () => {
      if (!predictionMarketAddress) return null;
      if (
        predictionMarketAddress === "0x0000000000000000000000000000000000000000"
      )
        return null;
      const publicClient = getPublicClient(config, { chainId });
      if (!publicClient) return null;
      const result = await publicClient.readContract({
        address: predictionMarketAddress,
        abi: OWNER_ABI,
        functionName: "owner",
      });
      console.log(
        "[useContractOwner] owner:",
        result,
        "chain:",
        chainId,
        "contract:",
        predictionMarketAddress,
      );
      return result as `0x${string}`;
    },
    enabled: !!predictionMarketAddress,
    staleTime: 300_000,
  });

  if (query.error) {
    console.error("[useContractOwner] error:", query.error);
  }

  return query;
}

/** Minimal ABI for reading OracleResolver.pendingResolution(uint256) */
const PENDING_RESOLUTION_ABI = [
  {
    name: "pendingResolution",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "marketId", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

/**
 * Hook to check whether a Chainlink oracle resolution request is pending
 * for a given market. Reads `pendingResolution(marketId)` from the
 * OracleResolver contract.
 *
 * Polls every 10 seconds while the result is `true` (waiting for callback),
 * and stops polling once it flips to `false`.
 *
 * @param marketId - The on-chain market ID (bigint), or undefined to skip
 * @returns TanStack query result with boolean (true = request in flight)
 */
export function usePendingResolution(marketId: bigint | undefined) {
  const publicClient = usePublicClient();
  const chainId = getAppConfig().defaultChainId;
  const oracleResolverAddress = getContractAddress(chainId, "oracleResolver");

  return useQuery({
    queryKey: ["pendingResolution", chainId, marketId?.toString()],
    queryFn: async () => {
      if (!publicClient || marketId === undefined || !oracleResolverAddress) {
        return false;
      }
      // Skip if oracle resolver is the zero address (not deployed)
      if (
        oracleResolverAddress === "0x0000000000000000000000000000000000000000"
      ) {
        return false;
      }
      const result = await publicClient.readContract({
        address: oracleResolverAddress,
        abi: PENDING_RESOLUTION_ABI,
        functionName: "pendingResolution",
        args: [marketId],
      });
      return result as boolean;
    },
    enabled:
      !!publicClient && marketId !== undefined && !!oracleResolverAddress,
    // Poll every 10s while pending, stop when not pending
    refetchInterval: (query) => (query.state.data === true ? 10_000 : false),
  });
}

/**
 * Hook to create a new prediction market (dealer only).
 *
 * @returns TanStack mutation for creating markets
 */
export function useCreateMarket() {
  const config = useConfig();
  const chainId = getAppConfig().defaultChainId;
  const client = useEVMClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tokenId,
      category,
      subCategory,
      deadline,
      description,
      oracleId,
      conditionData,
    }: {
      tokenId: bigint;
      category: bigint;
      subCategory: bigint;
      deadline: bigint;
      description: string;
      oracleId?: Address;
      conditionData?: `0x${string}`;
    }) => {
      const { walletClient, publicClient } = await getClients(config, chainId);

      if (!client || !walletClient || !publicClient) {
        throw new Error("Client not available");
      }

      const result = await client.createMarket(
        {
          walletClient,
          publicClient,
          chain: publicClient.chain,
        },
        {
          tokenId,
          category,
          subCategory,
          deadline,
          description,
          oracleId,
          conditionData,
        },
      );

      return result;
    },
    onSuccess: () => {
      invalidateWithRetry(queryClient, [
        ["heavymath", "markets"],
        ["heavymath", "dealer"],
      ]);
    },
    meta: {
      chainId,
    },
  });
}

/**
 * Hook to resolve a market with a manual resolution value (dealer only).
 *
 * @returns TanStack mutation for resolving markets
 */
export function useResolveMarket() {
  const config = useConfig();
  const chainId = getAppConfig().defaultChainId;
  const client = useEVMClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      marketId,
      positiveOutcome,
    }: {
      marketId: bigint;
      positiveOutcome: boolean;
    }) => {
      const { walletClient, publicClient } = await getClients(config, chainId);

      if (!client || !walletClient || !publicClient) {
        throw new Error("Client not available");
      }

      const result = await client.resolveMarket(
        {
          walletClient,
          publicClient,
          chain: publicClient.chain,
        },
        marketId,
        positiveOutcome,
      );

      return result;
    },
    onSuccess: () => {
      invalidateWithRetry(queryClient, [
        ["heavymath", "markets"],
        ["heavymath", "market"],
        ["heavymath", "market-history"],
      ]);
    },
    meta: {
      chainId,
    },
  });
}

/**
 * Hook to resolve a market using oracle data (anyone can call after deadline).
 *
 * @returns TanStack mutation for oracle-based resolution
 */
export function useResolveMarketWithOracle() {
  const config = useConfig();
  const chainId = getAppConfig().defaultChainId;
  const client = useEVMClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ marketId }: { marketId: bigint }) => {
      const { walletClient, publicClient } = await getClients(config, chainId);

      if (!client || !walletClient || !publicClient) {
        throw new Error("Client not available");
      }

      const result = await client.resolveMarketWithOracle(
        {
          walletClient,
          publicClient,
          chain: publicClient.chain,
        },
        marketId,
      );

      return result;
    },
    onSuccess: () => {
      invalidateWithRetry(queryClient, [
        ["heavymath", "markets"],
        ["heavymath", "market"],
        ["heavymath", "market-history"],
      ]);
    },
    meta: {
      chainId,
    },
  });
}

/**
 * Hook to request oracle resolution via Chainlink (step 1 of 2).
 * Anyone can call. Sends a Chainlink request to fetch the game result.
 *
 * @returns TanStack mutation for requesting oracle resolution
 */
export function useRequestOracleResolution() {
  const config = useConfig();
  const chainId = getAppConfig().defaultChainId;
  const client = useEVMClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ marketId }: { marketId: bigint }) => {
      const { walletClient, publicClient } = await getClients(config, chainId);

      if (!client || !walletClient || !publicClient) {
        throw new Error("Client not available");
      }

      const result = await client.requestOracleResolution(
        {
          walletClient,
          publicClient,
          chain: publicClient.chain,
        },
        marketId,
      );

      return result;
    },
    onSuccess: () => {
      invalidateWithRetry(queryClient, [["heavymath", "oracle-requests"]]);
    },
    meta: {
      chainId,
    },
  });
}

/**
 * Hook to complete oracle resolution after Chainlink callback (step 2 of 2).
 * Anyone can call after the Chainlink callback has delivered the result.
 *
 * @returns TanStack mutation for completing oracle resolution
 */
export function useCompleteOracleResolution() {
  const config = useConfig();
  const chainId = getAppConfig().defaultChainId;
  const client = useEVMClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ marketId }: { marketId: bigint }) => {
      const { walletClient, publicClient } = await getClients(config, chainId);

      if (!client || !walletClient || !publicClient) {
        throw new Error("Client not available");
      }

      const result = await client.completeOracleResolution(
        {
          walletClient,
          publicClient,
          chain: publicClient.chain,
        },
        marketId,
      );

      return result;
    },
    onSuccess: () => {
      invalidateWithRetry(queryClient, [
        ["heavymath", "markets"],
        ["heavymath", "market"],
        ["heavymath", "market-history"],
      ]);
    },
    meta: {
      chainId,
    },
  });
}

/**
 * Hook to cancel a market (dealer only).
 *
 * @returns TanStack mutation for cancelling markets
 */
export function useCancelMarket() {
  const config = useConfig();
  const chainId = getAppConfig().defaultChainId;
  const client = useEVMClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ marketId }: { marketId: bigint }) => {
      const { walletClient, publicClient } = await getClients(config, chainId);

      if (!client || !walletClient || !publicClient) {
        throw new Error("Client not available");
      }

      const result = await client.cancelMarket(
        {
          walletClient,
          publicClient,
          chain: publicClient.chain,
        },
        marketId,
      );

      return result;
    },
    onSuccess: () => {
      invalidateWithRetry(queryClient, [
        ["heavymath", "markets"],
        ["heavymath", "market"],
        ["heavymath", "market-history"],
      ]);
    },
    meta: {
      chainId,
    },
  });
}

/**
 * Hook to withdraw accumulated dealer fees from a resolved market (dealer only).
 *
 * @returns TanStack mutation for withdrawing dealer fees
 */
export function useWithdrawDealerFees() {
  const config = useConfig();
  const chainId = getAppConfig().defaultChainId;
  const client = useEVMClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ marketId }: { marketId: bigint }) => {
      const { walletClient, publicClient } = await getClients(config, chainId);

      if (!client || !walletClient || !publicClient) {
        throw new Error("Client not available");
      }

      const result = await client.withdrawDealerFees(
        {
          walletClient,
          publicClient,
          chain: publicClient.chain,
        },
        marketId,
      );

      return result;
    },
    onSuccess: () => {
      invalidateWithRetry(queryClient, [
        ["heavymath", "withdrawals"],
        ["heavymath", "market"],
      ]);
    },
    meta: {
      chainId,
    },
  });
}

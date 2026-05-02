/**
 * @fileoverview Hooks barrel export
 * @description Re-exports all contract interaction hooks for convenient importing.
 * Base hooks interact directly with the smart contract. Toast-wrapped variants
 * additionally provide user-facing notification feedback.
 */

/** Base contract interaction hooks (no UI feedback) */
export {
  useEVMClient,
  usePlacePrediction,
  useUpdatePrediction,
  useWithdrawPrediction,
  useClaimWinnings,
  useClaimRefund,
  useOnChainMarket,
  useOnChainPrediction,
  useCreateMarket,
  useResolveMarket,
  useResolveMarketWithOracle,
  useRequestOracleResolution,
  useCompleteOracleResolution,
  useLockMarket,
  useClaimLockRefund,
  useLockRefundAmount,
  useMarketSplit,
  useCancelMarket,
  useWithdrawDealerFees,
  useTestMode,
  useContractOwner,
  usePendingResolution,
} from "./useMarketContract";

/** Contract interaction hooks with toast notification feedback */
export {
  usePlacePredictionWithToast,
  useUpdatePredictionWithToast,
  useClaimWinningsWithToast,
  useClaimRefundWithToast,
  useCreateMarketWithToast,
  useResolveMarketWithToast,
  useResolveMarketWithOracleWithToast,
  useRequestOracleResolutionWithToast,
  useCompleteOracleResolutionWithToast,
  useLockMarketWithToast,
  useClaimLockRefundWithToast,
  useCancelMarketWithToast,
  useWithdrawDealerFeesWithToast,
} from "./useContractWithToast";

/** Dealer NFT hooks */
export { useMintDealerNFT, useMintDealerNFTWithToast } from "./useDealerNFT";

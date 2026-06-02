/**
 * Contract hooks with toast notification feedback
 * Wraps the base contract hooks with user-friendly toast notifications
 */

import { useCallback } from 'react';
import { useToastActions } from './useToastActions';
import { useHeavymathUiText } from '../components/HeavymathUiTextProvider';
import {
  usePlacePrediction,
  useUpdatePrediction,
  useClaimWinnings,
  useClaimRefund,
  useCreateMarket,
  useResolveMarket,
  useResolveMarketWithOracle,
  useRequestOracleResolution,
  useCompleteOracleResolution,
  useLockMarket,
  useClaimLockRefund,
  useCancelMarket,
  useWithdrawDealerFees,
} from './useMarketContract';

/**
 * Place prediction with toast feedback
 */
export function usePlacePredictionWithToast() {
  const mutation = usePlacePrediction();
  const toast = useToastActions();
  const text = useHeavymathUiText();

  const mutateAsync = useCallback(
    async (params: Parameters<typeof mutation.mutateAsync>[0]) => {
      toast.txPending(text('toast.placingPrediction'));

      try {
        const result = await mutation.mutateAsync(params);
        toast.success(
          text('toast.predictionPlaced'),
          text('toast.predictionPlacedDesc')
        );
        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : text('toast.placePredictionFailed');
        toast.txError(message);
        throw error;
      }
    },
    [mutation, toast, text]
  );

  return {
    ...mutation,
    mutateAsync,
    mutate: (params: Parameters<typeof mutation.mutate>[0]) => {
      mutateAsync(params).catch(() => {});
    },
  };
}

/**
 * Update prediction with toast feedback
 */
export function useUpdatePredictionWithToast() {
  const mutation = useUpdatePrediction();
  const toast = useToastActions();
  const text = useHeavymathUiText();

  const mutateAsync = useCallback(
    async (params: Parameters<typeof mutation.mutateAsync>[0]) => {
      toast.txPending(text('toast.updatingPrediction'));

      try {
        const result = await mutation.mutateAsync(params);
        toast.success(
          text('toast.predictionUpdated'),
          text('toast.predictionUpdatedDesc')
        );
        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : text('toast.updatePredictionFailed');
        toast.txError(message);
        throw error;
      }
    },
    [mutation, toast, text]
  );

  return {
    ...mutation,
    mutateAsync,
    mutate: (params: Parameters<typeof mutation.mutate>[0]) => {
      mutateAsync(params).catch(() => {});
    },
  };
}

/**
 * Claim winnings with toast feedback
 */
export function useClaimWinningsWithToast() {
  const mutation = useClaimWinnings();
  const toast = useToastActions();
  const text = useHeavymathUiText();

  const mutateAsync = useCallback(
    async (params: Parameters<typeof mutation.mutateAsync>[0]) => {
      toast.txPending(text('toast.claimingWinnings'));

      try {
        const result = await mutation.mutateAsync(params);
        toast.success(
          text('toast.winningsClaimed'),
          text('toast.winningsClaimedDesc')
        );
        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : text('toast.claimWinningsFailed');
        toast.txError(message);
        throw error;
      }
    },
    [mutation, toast, text]
  );

  return {
    ...mutation,
    mutateAsync,
    mutate: (params: Parameters<typeof mutation.mutate>[0]) => {
      mutateAsync(params).catch(() => {});
    },
  };
}

/**
 * Claim refund with toast feedback
 */
export function useClaimRefundWithToast() {
  const mutation = useClaimRefund();
  const toast = useToastActions();
  const text = useHeavymathUiText();

  const mutateAsync = useCallback(
    async (params: Parameters<typeof mutation.mutateAsync>[0]) => {
      toast.txPending(text('toast.claimingRefund'));

      try {
        const result = await mutation.mutateAsync(params);
        toast.success(
          text('toast.refundClaimed'),
          text('toast.refundClaimedDesc')
        );
        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : text('toast.claimRefundFailed');
        toast.txError(message);
        throw error;
      }
    },
    [mutation, toast, text]
  );

  return {
    ...mutation,
    mutateAsync,
    mutate: (params: Parameters<typeof mutation.mutate>[0]) => {
      mutateAsync(params).catch(() => {});
    },
  };
}

/**
 * Create market with toast feedback
 */
export function useCreateMarketWithToast() {
  const mutation = useCreateMarket();
  const toast = useToastActions();
  const text = useHeavymathUiText();

  const mutateAsync = useCallback(
    async (params: Parameters<typeof mutation.mutateAsync>[0]) => {
      toast.txPending(text('toast.creatingMarket'));

      try {
        const result = await mutation.mutateAsync(params);
        toast.success(
          text('toast.marketCreated'),
          text('toast.marketCreatedDesc')
        );
        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : text('toast.createMarketFailed');
        toast.txError(message);
        throw error;
      }
    },
    [mutation, toast, text]
  );

  return {
    ...mutation,
    mutateAsync,
    mutate: (params: Parameters<typeof mutation.mutate>[0]) => {
      mutateAsync(params).catch(() => {});
    },
  };
}

/**
 * Resolve market with toast feedback
 */
export function useResolveMarketWithToast() {
  const mutation = useResolveMarket();
  const toast = useToastActions();
  const text = useHeavymathUiText();

  const mutateAsync = useCallback(
    async (params: Parameters<typeof mutation.mutateAsync>[0]) => {
      toast.txPending(text('toast.resolvingMarket'));

      try {
        const result = await mutation.mutateAsync(params);
        toast.success(
          text('toast.marketResolved'),
          text('toast.marketResolvedDesc')
        );
        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : text('toast.resolveMarketFailed');
        toast.txError(message);
        throw error;
      }
    },
    [mutation, toast, text]
  );

  return {
    ...mutation,
    mutateAsync,
    mutate: (params: Parameters<typeof mutation.mutate>[0]) => {
      mutateAsync(params).catch(() => {});
    },
  };
}

/**
 * Resolve market with oracle with toast feedback
 */
export function useResolveMarketWithOracleWithToast() {
  const mutation = useResolveMarketWithOracle();
  const toast = useToastActions();
  const text = useHeavymathUiText();

  const mutateAsync = useCallback(
    async (params: Parameters<typeof mutation.mutateAsync>[0]) => {
      toast.txPending(text('toast.resolvingWithOracle'));

      try {
        const result = await mutation.mutateAsync(params);
        toast.success(
          text('toast.marketResolved'),
          text('toast.marketResolvedOracleDesc')
        );
        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : text('toast.resolveMarketFailed');
        toast.txError(message);
        throw error;
      }
    },
    [mutation, toast, text]
  );

  return {
    ...mutation,
    mutateAsync,
    mutate: (params: Parameters<typeof mutation.mutate>[0]) => {
      mutateAsync(params).catch(() => {});
    },
  };
}

/**
 * Request oracle resolution with toast feedback (step 1 of 2)
 */
export function useRequestOracleResolutionWithToast() {
  const mutation = useRequestOracleResolution();
  const toast = useToastActions();
  const text = useHeavymathUiText();

  const mutateAsync = useCallback(
    async (params: Parameters<typeof mutation.mutateAsync>[0]) => {
      toast.txPending(text('toast.requestingOracleResolution'));

      try {
        const result = await mutation.mutateAsync(params);
        toast.success(
          text('toast.resolutionRequested'),
          text('toast.resolutionRequestedDesc')
        );
        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : text('toast.requestOracleResolutionFailed');
        toast.txError(message);
        throw error;
      }
    },
    [mutation, toast, text]
  );

  return {
    ...mutation,
    mutateAsync,
    mutate: (params: Parameters<typeof mutation.mutate>[0]) => {
      mutateAsync(params).catch(() => {});
    },
  };
}

/**
 * Complete oracle resolution with toast feedback (step 2 of 2)
 */
export function useCompleteOracleResolutionWithToast() {
  const mutation = useCompleteOracleResolution();
  const toast = useToastActions();
  const text = useHeavymathUiText();

  const mutateAsync = useCallback(
    async (params: Parameters<typeof mutation.mutateAsync>[0]) => {
      toast.txPending(text('toast.completingOracleResolution'));

      try {
        const result = await mutation.mutateAsync(params);
        toast.success(
          text('toast.marketResolved'),
          text('toast.marketResolvedOracleDesc')
        );
        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : text('toast.completeOracleResolutionFailed');
        toast.txError(message);
        throw error;
      }
    },
    [mutation, toast, text]
  );

  return {
    ...mutation,
    mutateAsync,
    mutate: (params: Parameters<typeof mutation.mutate>[0]) => {
      mutateAsync(params).catch(() => {});
    },
  };
}

/**
 * Lock market with toast feedback
 */
export function useLockMarketWithToast() {
  const mutation = useLockMarket();
  const toast = useToastActions();
  const text = useHeavymathUiText();

  const mutateAsync = useCallback(
    async (params: Parameters<typeof mutation.mutateAsync>[0]) => {
      toast.txPending(text('toast.lockingMarket'));

      try {
        const result = await mutation.mutateAsync(params);
        toast.success(
          text('toast.marketLocked'),
          text('toast.marketLockedDesc')
        );
        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : text('toast.lockMarketFailed');
        toast.txError(message);
        throw error;
      }
    },
    [mutation, toast, text]
  );

  return {
    ...mutation,
    mutateAsync,
    mutate: (params: Parameters<typeof mutation.mutate>[0]) => {
      mutateAsync(params).catch(() => {});
    },
  };
}

/**
 * Claim lock refund with toast feedback
 */
export function useClaimLockRefundWithToast() {
  const mutation = useClaimLockRefund();
  const toast = useToastActions();
  const text = useHeavymathUiText();

  const mutateAsync = useCallback(
    async (params: Parameters<typeof mutation.mutateAsync>[0]) => {
      toast.txPending(text('toast.claimingPartialRefund'));

      try {
        const result = await mutation.mutateAsync(params);
        toast.success(
          text('toast.refundClaimed'),
          text('toast.lockRefundClaimedDesc')
        );
        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : text('toast.claimLockRefundFailed');
        toast.txError(message);
        throw error;
      }
    },
    [mutation, toast, text]
  );

  return {
    ...mutation,
    mutateAsync,
    mutate: (params: Parameters<typeof mutation.mutate>[0]) => {
      mutateAsync(params).catch(() => {});
    },
  };
}

/**
 * Cancel market with toast feedback
 */
export function useCancelMarketWithToast() {
  const mutation = useCancelMarket();
  const toast = useToastActions();
  const text = useHeavymathUiText();

  const mutateAsync = useCallback(
    async (params: Parameters<typeof mutation.mutateAsync>[0]) => {
      toast.txPending(text('toast.cancellingMarket'));

      try {
        const result = await mutation.mutateAsync(params);
        toast.success(
          text('toast.marketCancelled'),
          text('toast.marketCancelledDesc')
        );
        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : text('toast.cancelMarketFailed');
        toast.txError(message);
        throw error;
      }
    },
    [mutation, toast, text]
  );

  return {
    ...mutation,
    mutateAsync,
    mutate: (params: Parameters<typeof mutation.mutate>[0]) => {
      mutateAsync(params).catch(() => {});
    },
  };
}

/**
 * Withdraw dealer fees with toast feedback
 */
export function useWithdrawDealerFeesWithToast() {
  const mutation = useWithdrawDealerFees();
  const toast = useToastActions();
  const text = useHeavymathUiText();

  const mutateAsync = useCallback(
    async (params: Parameters<typeof mutation.mutateAsync>[0]) => {
      toast.txPending(text('toast.withdrawingFees'));

      try {
        const result = await mutation.mutateAsync(params);
        toast.success(
          text('toast.feesWithdrawn'),
          text('toast.feesWithdrawnDesc')
        );
        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : text('toast.withdrawFeesFailed');
        toast.txError(message);
        throw error;
      }
    },
    [mutation, toast, text]
  );

  return {
    ...mutation,
    mutateAsync,
    mutate: (params: Parameters<typeof mutation.mutate>[0]) => {
      mutateAsync(params).catch(() => {});
    },
  };
}

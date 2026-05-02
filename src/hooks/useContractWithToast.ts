/**
 * Contract hooks with toast notification feedback
 * Wraps the base contract hooks with user-friendly toast notifications
 */

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useToastActions } from './useToastActions';
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
  const { t } = useTranslation('common');

  const mutateAsync = useCallback(
    async (params: Parameters<typeof mutation.mutateAsync>[0]) => {
      toast.txPending(t('toast.placingPrediction'));

      try {
        const result = await mutation.mutateAsync(params);
        toast.success(
          t('toast.predictionPlaced'),
          t('toast.predictionPlacedDesc')
        );
        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : t('toast.placePredictionFailed');
        toast.txError(message);
        throw error;
      }
    },
    [mutation, toast, t]
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
  const { t } = useTranslation('common');

  const mutateAsync = useCallback(
    async (params: Parameters<typeof mutation.mutateAsync>[0]) => {
      toast.txPending(t('toast.updatingPrediction'));

      try {
        const result = await mutation.mutateAsync(params);
        toast.success(
          t('toast.predictionUpdated'),
          t('toast.predictionUpdatedDesc')
        );
        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : t('toast.updatePredictionFailed');
        toast.txError(message);
        throw error;
      }
    },
    [mutation, toast, t]
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
  const { t } = useTranslation('common');

  const mutateAsync = useCallback(
    async (params: Parameters<typeof mutation.mutateAsync>[0]) => {
      toast.txPending(t('toast.claimingWinnings'));

      try {
        const result = await mutation.mutateAsync(params);
        toast.success(
          t('toast.winningsClaimed'),
          t('toast.winningsClaimedDesc')
        );
        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : t('toast.claimWinningsFailed');
        toast.txError(message);
        throw error;
      }
    },
    [mutation, toast, t]
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
  const { t } = useTranslation('common');

  const mutateAsync = useCallback(
    async (params: Parameters<typeof mutation.mutateAsync>[0]) => {
      toast.txPending(t('toast.claimingRefund'));

      try {
        const result = await mutation.mutateAsync(params);
        toast.success(t('toast.refundClaimed'), t('toast.refundClaimedDesc'));
        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : t('toast.claimRefundFailed');
        toast.txError(message);
        throw error;
      }
    },
    [mutation, toast, t]
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
  const { t } = useTranslation('common');

  const mutateAsync = useCallback(
    async (params: Parameters<typeof mutation.mutateAsync>[0]) => {
      toast.txPending(t('toast.creatingMarket'));

      try {
        const result = await mutation.mutateAsync(params);
        toast.success(t('toast.marketCreated'), t('toast.marketCreatedDesc'));
        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : t('toast.createMarketFailed');
        toast.txError(message);
        throw error;
      }
    },
    [mutation, toast, t]
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
  const { t } = useTranslation('common');

  const mutateAsync = useCallback(
    async (params: Parameters<typeof mutation.mutateAsync>[0]) => {
      toast.txPending(t('toast.resolvingMarket'));

      try {
        const result = await mutation.mutateAsync(params);
        toast.success(t('toast.marketResolved'), t('toast.marketResolvedDesc'));
        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : t('toast.resolveMarketFailed');
        toast.txError(message);
        throw error;
      }
    },
    [mutation, toast, t]
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
  const { t } = useTranslation('common');

  const mutateAsync = useCallback(
    async (params: Parameters<typeof mutation.mutateAsync>[0]) => {
      toast.txPending(t('toast.resolvingWithOracle'));

      try {
        const result = await mutation.mutateAsync(params);
        toast.success(
          t('toast.marketResolved'),
          t('toast.marketResolvedOracleDesc')
        );
        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : t('toast.resolveMarketFailed');
        toast.txError(message);
        throw error;
      }
    },
    [mutation, toast, t]
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
  const { t } = useTranslation('common');

  const mutateAsync = useCallback(
    async (params: Parameters<typeof mutation.mutateAsync>[0]) => {
      toast.txPending(t('toast.requestingOracleResolution'));

      try {
        const result = await mutation.mutateAsync(params);
        toast.success(
          t('toast.resolutionRequested'),
          t('toast.resolutionRequestedDesc')
        );
        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : t('toast.requestOracleResolutionFailed');
        toast.txError(message);
        throw error;
      }
    },
    [mutation, toast, t]
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
  const { t } = useTranslation('common');

  const mutateAsync = useCallback(
    async (params: Parameters<typeof mutation.mutateAsync>[0]) => {
      toast.txPending(t('toast.completingOracleResolution'));

      try {
        const result = await mutation.mutateAsync(params);
        toast.success(
          t('toast.marketResolved'),
          t('toast.marketResolvedOracleDesc')
        );
        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : t('toast.completeOracleResolutionFailed');
        toast.txError(message);
        throw error;
      }
    },
    [mutation, toast, t]
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
  const { t } = useTranslation('common');

  const mutateAsync = useCallback(
    async (params: Parameters<typeof mutation.mutateAsync>[0]) => {
      toast.txPending(t('toast.lockingMarket'));

      try {
        const result = await mutation.mutateAsync(params);
        toast.success(t('toast.marketLocked'), t('toast.marketLockedDesc'));
        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : t('toast.lockMarketFailed');
        toast.txError(message);
        throw error;
      }
    },
    [mutation, toast, t]
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
  const { t } = useTranslation('common');

  const mutateAsync = useCallback(
    async (params: Parameters<typeof mutation.mutateAsync>[0]) => {
      toast.txPending(t('toast.claimingPartialRefund'));

      try {
        const result = await mutation.mutateAsync(params);
        toast.success(
          t('toast.refundClaimed'),
          t('toast.lockRefundClaimedDesc')
        );
        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : t('toast.claimLockRefundFailed');
        toast.txError(message);
        throw error;
      }
    },
    [mutation, toast, t]
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
  const { t } = useTranslation('common');

  const mutateAsync = useCallback(
    async (params: Parameters<typeof mutation.mutateAsync>[0]) => {
      toast.txPending(t('toast.cancellingMarket'));

      try {
        const result = await mutation.mutateAsync(params);
        toast.success(
          t('toast.marketCancelled'),
          t('toast.marketCancelledDesc')
        );
        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : t('toast.cancelMarketFailed');
        toast.txError(message);
        throw error;
      }
    },
    [mutation, toast, t]
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
  const { t } = useTranslation('common');

  const mutateAsync = useCallback(
    async (params: Parameters<typeof mutation.mutateAsync>[0]) => {
      toast.txPending(t('toast.withdrawingFees'));

      try {
        const result = await mutation.mutateAsync(params);
        toast.success(t('toast.feesWithdrawn'), t('toast.feesWithdrawnDesc'));
        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : t('toast.withdrawFeesFailed');
        toast.txError(message);
        throw error;
      }
    },
    [mutation, toast, t]
  );

  return {
    ...mutation,
    mutateAsync,
    mutate: (params: Parameters<typeof mutation.mutate>[0]) => {
      mutateAsync(params).catch(() => {});
    },
  };
}

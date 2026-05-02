import { useTranslation } from 'react-i18next';
import { useToast } from '@sudobility/components/ui/toast';

/**
 * Extract user-friendly message from verbose viem/wagmi errors.
 * Viem errors include full request args, contract call details, and docs URLs.
 * We extract just the "Details:" line or the first meaningful line.
 */
function shortenErrorMessage(message: string): string {
  // Extract "Details: ..." line (viem puts the user-friendly reason here)
  const detailsMatch = message.match(/Details:\s*(.+)/);
  if (detailsMatch) return detailsMatch[1].trim();

  // Extract "reason: ..." from contract revert
  const reasonMatch = message.match(/reason:\s*(.+)/);
  if (reasonMatch) return reasonMatch[1].trim();

  // Take just the first line if multi-line
  const firstLine = message.split('\n')[0].trim();
  if (firstLine.length <= 200) return firstLine;

  return firstLine.slice(0, 200) + '…';
}

/**
 * Transaction-specific toast helpers built on @sudobility/components toast.
 */
export function useToastActions() {
  const { t } = useTranslation('common');
  const toast = useToast();

  const fmt = (title: string, message?: string) => (message ? `${title}: ${message}` : title);

  return {
    success: (title: string, message?: string) => toast.success(fmt(title, message), 5000),
    error: (title: string, message?: string) =>
      toast.error(fmt(title, message ? shortenErrorMessage(message) : undefined), 0),
    warning: (title: string, message?: string) => toast.warning(fmt(title, message), 10000),
    info: (title: string, message?: string) => toast.info(fmt(title, message), 5000),
    txPending: (message?: string) =>
      toast.info(fmt(t('toast.txPending'), message || t('toast.confirmInWallet')), 5000),
    txSuccess: (message?: string) =>
      toast.success(fmt(t('toast.txConfirmed'), message || t('toast.txSuccessDefault')), 5000),
    txError: (message?: string) =>
      toast.error(
        fmt(
          t('toast.txFailed'),
          message ? shortenErrorMessage(message) : t('toast.txErrorDefault')
        ),
        0
      ),
  };
}

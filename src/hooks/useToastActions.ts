import { useToast } from '@sudobility/components/ui/toast';
import { useHeavymathUiText } from '../components/HeavymathUiTextProvider';

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
  const text = useHeavymathUiText();
  const toast = useToast();

  const fmt = (title: string, message?: string) =>
    message ? `${title}: ${message}` : title;

  return {
    success: (title: string, message?: string) =>
      toast.success(fmt(title, message), 5000),
    error: (title: string, message?: string) =>
      toast.error(
        fmt(title, message ? shortenErrorMessage(message) : undefined),
        0
      ),
    warning: (title: string, message?: string) =>
      toast.warning(fmt(title, message), 10000),
    info: (title: string, message?: string) =>
      toast.info(fmt(title, message), 5000),
    txPending: (message?: string) =>
      toast.info(
        fmt(text('toast.txPending'), message || text('toast.confirmInWallet')),
        5000
      ),
    txSuccess: (message?: string) =>
      toast.success(
        fmt(
          text('toast.txConfirmed'),
          message || text('toast.txSuccessDefault')
        ),
        5000
      ),
    txError: (message?: string) =>
      toast.error(
        fmt(
          text('toast.txFailed'),
          message ? shortenErrorMessage(message) : text('toast.txErrorDefault')
        ),
        0
      ),
  };
}

import type { MarketStatus } from '@heavymath/indexer_client';
import { clsx } from 'clsx';
import { useHeavymathUiText } from '../HeavymathUiTextProvider';

interface MarketStatusBadgeProps {
  status: MarketStatus;
  size?: 'sm' | 'md';
}

export function MarketStatusBadge({
  status,
  size = 'sm',
}: MarketStatusBadgeProps) {
  const text = useHeavymathUiText();

  const statusConfig: Record<string, { label: string; className: string }> = {
    Active: {
      label: text('status.active'),
      className: 'bg-success-500/10 text-success-500 border-success-500/20',
    },
    Locked: {
      label: text('status.locked'),
      className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    },
    Resolved: {
      label: text('status.resolved'),
      className: 'bg-primary/10 text-primary border-primary/20',
    },
    Cancelled: {
      label: text('status.cancelled'),
      className: 'bg-muted text-muted-foreground border-border',
    },
    Abandoned: {
      label: text('status.abandoned'),
      className: 'bg-danger-500/10 text-danger-500 border-danger-500/20',
    },
  };

  const config = statusConfig[status] || statusConfig.Active;

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

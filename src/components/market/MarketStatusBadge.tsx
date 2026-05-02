import { useTranslation } from 'react-i18next';
import type { MarketStatus } from '@heavymath/indexer_client';
import { clsx } from 'clsx';

interface MarketStatusBadgeProps {
  status: MarketStatus;
  size?: 'sm' | 'md';
}

export function MarketStatusBadge({
  status,
  size = 'sm',
}: MarketStatusBadgeProps) {
  const { t } = useTranslation('common');

  const statusConfig: Record<string, { label: string; className: string }> = {
    Active: {
      label: t('status.active'),
      className: 'bg-success-500/10 text-success-500 border-success-500/20',
    },
    Locked: {
      label: t('status.locked', 'Locked'),
      className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    },
    Resolved: {
      label: t('status.resolved'),
      className: 'bg-primary/10 text-primary border-primary/20',
    },
    Cancelled: {
      label: t('status.cancelled'),
      className: 'bg-muted text-muted-foreground border-border',
    },
    Abandoned: {
      label: t('status.abandoned'),
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

import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Market } from '@heavymath/indexer_client';
import { MarketStatusBadge } from './MarketStatusBadge';
import { formatDate } from '../../utils/format';
import { getMarketDisplayInfo } from '../../utils/marketDisplay';
import { ConditionType, decodeConditionData } from '../../utils/conditionData';

interface MarketCardProps {
  market: Market;
  showCategory?: boolean;
}

export function MarketCard({ market, showCategory = true }: MarketCardProps) {
  const { lang } = useParams<{ lang: string }>();
  const { t } = useTranslation('common');
  const isActive = market.status === 'Active';
  const { category, subcategory, displayTitle, displaySubtitle } = getMarketDisplayInfo(market);

  const conditionLabel = (() => {
    if (!market.conditionData) return null;
    try {
      const condition = decodeConditionData(market.conditionData);
      if (condition.type === ConditionType.MatchScore) return t('market.conditionScore', 'Score');
      if (condition.type === ConditionType.Tournament)
        return t('market.conditionTournament', 'Tournament');
      return null; // Don't show badge for WinLoss (default)
    } catch {
      return null;
    }
  })();

  return (
    <Link
      to={`/${lang}/markets/${market.id}`}
      className="block p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-all hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          {showCategory && (category || subcategory) && (
            <div className="flex items-center gap-1.5 mb-1">
              {category && (
                <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  {category}
                </span>
              )}
              {subcategory && (
                <span className="inline-block text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {subcategory}
                </span>
              )}
              {conditionLabel && (
                <span className="inline-block text-xs font-medium text-accent-foreground bg-accent px-1.5 py-0.5 rounded">
                  {conditionLabel}
                </span>
              )}
            </div>
          )}
          <h3 className="font-semibold text-foreground line-clamp-2">{displayTitle}</h3>
        </div>
        <MarketStatusBadge status={market.status} />
      </div>

      {/* Description */}
      {displaySubtitle && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{displaySubtitle}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {t('market.dealer', 'Dealer')}: {market.dealerAddress.slice(0, 6)}...
            {market.dealerAddress.slice(-4)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted-foreground">{formatDate(market.createdAt)}</span>
        </div>
      </div>

      {/* Status indicator */}
      {isActive && (
        <div className="mt-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></span>
          <span className="text-xs text-success-500">
            {t('market.openForPredictions', 'Open for predictions')}
          </span>
        </div>
      )}
    </Link>
  );
}

import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Market } from '@heavymath/indexer_client';
import { MarketStatusBadge } from './MarketStatusBadge';
import { formatDate, formatUSDC } from '../../utils/format';
import { isValidSportsOracleId, decodeOracleId } from '../../utils/oracleId';
import { getSportSlug, type SportCode } from '../../config/sportCodes';
import {
  SoccerBallIcon,
  BasketballIcon,
  FootballIcon,
  BaseballIcon,
  HockeyIcon,
  RugbyIcon,
  RacingIcon,
  MmaIcon,
  HandballIcon,
  VolleyballIcon,
} from '../../components/icons';
import { useClaimWinningsWithToast, useClaimRefundWithToast } from '../../hooks';

const SPORT_ICONS: Record<SportCode, React.ComponentType<{ className?: string }>> = {
  1: SoccerBallIcon,
  2: BasketballIcon,
  3: FootballIcon,
  4: BaseballIcon,
  5: HockeyIcon,
  6: RugbyIcon,
  7: RacingIcon,
  8: MmaIcon,
  9: HandballIcon,
  10: VolleyballIcon,
};

const SPORT_COLORS: Record<SportCode, string> = {
  1: 'bg-green-500',
  2: 'bg-orange-500',
  3: 'bg-amber-700',
  4: 'bg-red-500',
  5: 'bg-blue-500',
  6: 'bg-emerald-600',
  7: 'bg-red-600',
  8: 'bg-purple-600',
  9: 'bg-teal-500',
  10: 'bg-indigo-500',
};

interface SportPredictionCardProps {
  prediction: {
    id: string;
    marketId: string;
    percentage: number;
    amount: string;
    createdAt: string;
    hasClaimed: boolean;
    market?: Market;
  };
}

export function SportPredictionCard({ prediction }: SportPredictionCardProps) {
  const { lang } = useParams<{ lang: string }>();
  const { t } = useTranslation('common');
  const claimWinnings = useClaimWinningsWithToast();
  const claimRefund = useClaimRefundWithToast();

  const market = prediction.market;
  const hasClaimed = prediction.hasClaimed;
  const canClaim = market?.status === 'Resolved' && !hasClaimed;
  const canRefund =
    (market?.status === 'Cancelled' || market?.status === 'Abandoned') && !hasClaimed;

  // Decode sport context from oracleId
  const sportInfo = (() => {
    const oracleId = (market as { oracleId?: string | null })?.oracleId;
    if (!oracleId) return null;
    try {
      const hex = oracleId as `0x${string}`;
      if (!isValidSportsOracleId(hex)) return null;
      const { sportCode, gameId } = decodeOracleId(hex);
      const slug = getSportSlug(sportCode);
      return { sportCode, gameId, slug };
    } catch {
      return null;
    }
  })();

  const handleClaim = async () => {
    try {
      await claimWinnings.mutateAsync({ marketId: BigInt(prediction.marketId) });
    } catch (error) {
      console.error('Failed to claim winnings:', error);
    }
  };

  const handleRefund = async () => {
    try {
      await claimRefund.mutateAsync({ marketId: BigInt(prediction.marketId) });
    } catch (error) {
      console.error('Failed to claim refund:', error);
    }
  };

  const SportIcon = sportInfo ? SPORT_ICONS[sportInfo.sportCode] : null;
  const sportColor = sportInfo ? SPORT_COLORS[sportInfo.sportCode] : null;
  const gameLink = sportInfo?.slug
    ? `/${lang || 'en'}/sports/${sportInfo.slug}/games/${sportInfo.gameId}`
    : null;

  return (
    <div className="p-4 rounded-lg border border-border bg-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {/* Sport icon badge */}
            {SportIcon && sportColor && (
              <div
                className={`w-6 h-6 rounded-full ${sportColor} flex items-center justify-center flex-shrink-0`}
              >
                <SportIcon className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            {sportInfo?.slug && (
              <span className="text-xs text-primary font-medium capitalize">
                {t(`nav.${sportInfo.slug}`, sportInfo.slug)}
              </span>
            )}
          </div>

          <Link
            to={`/${lang || 'en'}/markets/${prediction.marketId}`}
            className="font-medium hover:text-primary transition-colors line-clamp-1"
          >
            {market?.title || market?.description || `Market #${prediction.marketId}`}
          </Link>

          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>
              {t('sportPredictionCard.predicted')}{' '}
              <strong className="text-foreground">{prediction.percentage}%</strong>
            </span>
            <span>
              {t('sportPredictionCard.staked')}{' '}
              <strong className="text-foreground">{formatUSDC(BigInt(prediction.amount))}</strong>
            </span>
            <span>{formatDate(prediction.createdAt)}</span>
          </div>

          {/* Link to game page */}
          {gameLink && (
            <Link to={gameLink} className="inline-block mt-2 text-xs text-primary hover:underline">
              {t('sportPredictionCard.viewGameDetails')}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          {market && <MarketStatusBadge status={market.status} size="sm" />}

          {canClaim && (
            <button
              onClick={handleClaim}
              disabled={claimWinnings.isPending}
              className="px-3 py-1.5 text-sm rounded-lg bg-success-500 text-white font-medium hover:bg-success-600 transition-colors disabled:opacity-50"
            >
              {claimWinnings.isPending
                ? t('sportPredictionCard.claiming')
                : t('sportPredictionCard.claim')}
            </button>
          )}

          {canRefund && (
            <button
              onClick={handleRefund}
              disabled={claimRefund.isPending}
              className="px-3 py-1.5 text-sm rounded-lg bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors disabled:opacity-50"
            >
              {claimRefund.isPending
                ? t('sportPredictionCard.claiming')
                : t('sportPredictionCard.refund')}
            </button>
          )}

          {hasClaimed && (
            <span className="px-3 py-1.5 text-sm rounded-lg bg-muted text-muted-foreground">
              {t('sportPredictionCard.claimed')}
            </span>
          )}
        </div>
      </div>

      {/* Resolution info for resolved markets */}
      {market?.status === 'Resolved' && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              {t('sportPredictionCard.yourPrediction')}{' '}
              <strong className="text-foreground">{prediction.percentage}%</strong>
            </span>
            <span className="text-primary font-medium">
              {t('sportPredictionCard.marketResolved')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

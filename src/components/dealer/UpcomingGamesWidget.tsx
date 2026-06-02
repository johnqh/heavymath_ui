import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { IndexerClient } from '@heavymath/indexer_client';
import { isValidSportsOracleId, decodeOracleId } from '../../utils/oracleId';
import { SPORT_CODES, type SportCode } from '../../config/sportCodes';
import { CATEGORIES } from '../../types/market';
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
import { useHeavymathUiText } from '../HeavymathUiTextProvider';

const SPORT_ICONS: Record<
  SportCode,
  React.ComponentType<{ className?: string }>
> = {
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

interface SportMarketCount {
  sportCode: SportCode;
  slug: string;
  count: number;
}

interface UpcomingGamesWidgetProps {
  indexerClient: IndexerClient;
  dealerAddress: string;
}

function useMarketCountsBySport(
  indexerClient: IndexerClient,
  dealerAddress: string
) {
  return useQuery({
    queryKey: ['dealerMarketCountsBySport', dealerAddress],
    queryFn: async () => {
      const response = await indexerClient.getMarkets({
        dealer: dealerAddress,
        category: CATEGORIES.SPORTS,
        limit: 500,
      });

      const markets = response.data ?? [];
      const counts = new Map<SportCode, number>();

      for (const market of markets) {
        if (!market.oracleId) continue;
        try {
          const hex = market.oracleId as `0x${string}`;
          if (!isValidSportsOracleId(hex)) continue;
          const { sportCode } = decodeOracleId(hex);
          counts.set(sportCode, (counts.get(sportCode) ?? 0) + 1);
        } catch {
          // Skip invalid oracleIds
        }
      }

      const result: SportMarketCount[] = [];
      for (const [slug, code] of Object.entries(SPORT_CODES)) {
        const count = counts.get(code as SportCode) ?? 0;
        if (count > 0) {
          result.push({ sportCode: code as SportCode, slug, count });
        }
      }
      result.sort((a, b) => b.count - a.count);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function UpcomingGamesWidget({
  indexerClient,
  dealerAddress,
}: UpcomingGamesWidgetProps) {
  const { lang } = useParams<{ lang: string }>();
  const text = useHeavymathUiText();
  const { data: sportCounts, isLoading } = useMarketCountsBySport(
    indexerClient,
    dealerAddress
  );

  return (
    <div className='p-6 rounded-lg border border-border bg-card'>
      <h3 className='font-semibold mb-4'>{text('dealer.marketsBySport')}</h3>

      {isLoading ? (
        <div className='space-y-2'>
          {[1, 2, 3].map(i => (
            <div key={i} className='animate-pulse h-8 bg-muted rounded' />
          ))}
        </div>
      ) : !sportCounts || sportCounts.length === 0 ? (
        <div className='text-sm text-muted-foreground text-center py-4'>
          <p>{text('dealer.noSportsMarkets')}</p>
          <Link
            to={`/${lang || 'en'}/sports`}
            className='text-primary hover:underline mt-2 inline-block'
          >
            {text('dealer.browseSports')}
          </Link>
        </div>
      ) : (
        <div className='space-y-2'>
          {sportCounts.map(({ sportCode, slug, count }) => {
            const Icon = SPORT_ICONS[sportCode];
            return (
              <Link
                key={sportCode}
                to={`/${lang || 'en'}/sports/${slug}`}
                className='flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors'
              >
                <div className='flex items-center gap-2'>
                  <Icon className='w-5 h-5 text-muted-foreground' />
                  <span className='text-sm font-medium'>
                    {text(`nav.${slug}`)}
                  </span>
                </div>
                <span className='text-sm text-muted-foreground'>
                  {text('dealer.marketCount', { count })}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

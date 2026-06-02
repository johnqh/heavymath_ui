import { useIndexer } from '../../context/IndexerContext';
import { useLeagueMarkets } from '../../hooks/useLeagueMarkets';
import { MarketCard } from './MarketCard';
import { TournamentMarketForm } from './TournamentMarketForm';
import type { SportCode } from '../../config/sportCodes';
import { variants } from '@sudobility/design';
import { useHeavymathUiText } from '../HeavymathUiTextProvider';

interface TeamOption {
  id: number;
  name: string;
  logo?: string | null;
}

interface LeagueMarketsSectionProps {
  sportCode: SportCode;
  leagueId: number;
  season: number;
  leagueName: string;
  teams: TeamOption[];
}

export function LeagueMarketsSection({
  sportCode,
  leagueId,
  season,
  leagueName,
  teams,
}: LeagueMarketsSectionProps) {
  const text = useHeavymathUiText();
  const { indexerClient } = useIndexer();
  const { data: markets, isLoading } = useLeagueMarkets(
    indexerClient,
    sportCode,
    leagueId
  );

  const hasMarkets = markets && markets.length > 0;

  return (
    <div>
      <h2 className='text-lg font-semibold mb-4'>
        {text('markets.predictionMarkets')}
      </h2>

      {isLoading ? (
        <div className='space-y-3'>
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className={`${variants.loading.skeleton.base()} rounded-lg h-24`}
            />
          ))}
        </div>
      ) : hasMarkets ? (
        <div className='space-y-3 mb-4'>
          {markets.map(market => (
            <MarketCard key={market.id} market={market} showCategory={false} />
          ))}
        </div>
      ) : (
        <p className='text-sm text-muted-foreground mb-4'>
          {text('markets.noMarketsForLeague')}
        </p>
      )}

      <TournamentMarketForm
        sportCode={sportCode}
        leagueId={leagueId}
        season={season}
        leagueName={leagueName}
        teams={teams}
      />
    </div>
  );
}

import { TeamTournamentMarketForm } from './TeamTournamentMarketForm';
import type { SportCode } from '../../config/sportCodes';
import { useHeavymathUiText } from '../HeavymathUiTextProvider';

interface TournamentOption {
  id: number;
  name: string;
  logo?: string | null;
}

interface TeamMarketsSectionProps {
  sportCode: SportCode;
  teamId: number;
  teamName: string;
  teamLogo?: string | null;
  season: number;
  tournaments: TournamentOption[];
}

export function TeamMarketsSection({
  sportCode,
  teamId,
  teamName,
  teamLogo,
  season,
  tournaments,
}: TeamMarketsSectionProps) {
  const text = useHeavymathUiText();

  return (
    <div>
      <h2 className='text-lg font-semibold mb-4'>
        {text('markets.predictionMarkets')}
      </h2>

      <p className='text-sm text-muted-foreground mb-4'>
        {text('markets.noMarketsForTeam')}
      </p>

      <TeamTournamentMarketForm
        sportCode={sportCode}
        teamId={teamId}
        teamName={teamName}
        teamLogo={teamLogo}
        season={season}
        tournaments={tournaments}
      />
    </div>
  );
}

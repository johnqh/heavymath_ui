import { useTranslation } from 'react-i18next';
import { TeamTournamentMarketForm } from './TeamTournamentMarketForm';
import type { SportCode } from '../../config/sportCodes';

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
  const { t } = useTranslation('common');

  return (
    <div>
      <h2 className='text-lg font-semibold mb-4'>
        {t('markets.predictionMarkets', 'Prediction Markets')}
      </h2>

      <p className='text-sm text-muted-foreground mb-4'>
        {t(
          'markets.noMarketsForTeam',
          'No prediction markets for this team yet.'
        )}
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

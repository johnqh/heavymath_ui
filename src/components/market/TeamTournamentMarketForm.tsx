import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@sudobility/components';
import { useAuth } from '../../context/WalletAuthContext';
import { AnimatedCollapse } from '../../components/ui/AnimatedCollapse';
import { DealerNFTSelector } from '../../components/dealer/DealerNFTSelector';
import { useCreateMarketWithToast } from '../../hooks';
import { useDealerPermission } from '../../hooks/useDealerPermission';
import { encodeOracleId } from '../../utils/oracleId';
import { ConditionType, encodeConditionData } from '../../utils/conditionData';
import { getNow, toChainDate } from '../../utils/datetime';
import { CATEGORIES } from '../../types/market';
import type { SportCode } from '../../config/sportCodes';
import { ui } from '@sudobility/design';

interface TournamentOption {
  id: number;
  name: string;
  logo?: string | null;
}

interface TeamTournamentMarketFormProps {
  sportCode: SportCode;
  teamId: number;
  teamName: string;
  teamLogo?: string | null;
  season: number;
  tournaments: TournamentOption[];
  /** Pre-select a specific tournament */
  preselectedTournamentId?: number;
}

export function TeamTournamentMarketForm({
  sportCode,
  teamId,
  teamName,
  teamLogo,
  season,
  tournaments,
  preselectedTournamentId,
}: TeamTournamentMarketFormProps) {
  const { t } = useTranslation('common');
  const { isDealer, dealerTokenIds } = useAuth();
  const createMarket = useCreateMarketWithToast();

  const [selectedNFTTokenId, setSelectedNFTTokenId] = useState<bigint | undefined>(
    dealerTokenIds?.[0]
  );
  // Sync when dealerTokenIds loads asynchronously after mount
  useEffect(() => {
    if (selectedNFTTokenId === undefined && dealerTokenIds && dealerTokenIds.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from async context value
      setSelectedNFTTokenId(dealerTokenIds[0]);
    }
  }, [dealerTokenIds, selectedNFTTokenId]);

  const { hasPermission, isLoading: isPermissionLoading } = useDealerPermission(
    sportCode,
    selectedNFTTokenId
  );

  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(
    preselectedTournamentId ?? null
  );
  const [expectation, setExpectation] = useState<'1' | '0'>('1');
  const [deadline, setDeadline] = useState('');

  if (!isDealer) return null;

  const tokenId = selectedNFTTokenId;
  if (tokenId === undefined) return null;
  if (tournaments.length === 0) return null;

  if (!isPermissionLoading && !hasPermission) {
    return (
      <div className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 p-4">
        <p className="text-sm text-amber-700 dark:text-amber-400">{t('dealer.noPermission')}</p>
      </div>
    );
  }

  const now = getNow();
  const deadlineDate = deadline ? new Date(deadline) : null;
  const minDeadlineMs = 24 * 60 * 60 * 1000;
  const isDeadlineValid =
    deadlineDate !== null && deadlineDate.getTime() - now.getTime() >= minDeadlineMs;
  const canSubmit = selectedTournamentId !== null && isDeadlineValid && !createMarket.isPending;

  const selectedTournament = tournaments.find(t => t.id === selectedTournamentId);

  const handleSubmit = async () => {
    if (!canSubmit || !selectedTournamentId || !deadlineDate) return;

    const oracleId = encodeOracleId(sportCode, selectedTournamentId);
    const chainDeadline = toChainDate(deadlineDate);
    const deadlineBigInt = BigInt(Math.floor(chainDeadline.getTime() / 1000));

    const conditionData = encodeConditionData({
      type: ConditionType.Tournament,
      teamId,
      expectation: expectation === '1',
    }) as `0x${string}`;

    const verb =
      expectation === '1' ? t('inlineCreateMarket.wins') : t('inlineCreateMarket.doesNotWin');
    const tournamentName = selectedTournament?.name ?? `Tournament #${selectedTournamentId}`;
    const title = `${teamName} ${verb} ${season} ${tournamentName}`;
    const desc = `${tournamentName} ${season} — ${teamName} ${verb}`;

    await createMarket.mutateAsync({
      tokenId: BigInt(tokenId),
      category: BigInt(CATEGORIES.SPORTS),
      subCategory: BigInt(sportCode),
      deadline: deadlineBigInt,
      description: `${title}\n${desc}`,
      oracleId,
      conditionData,
    });

    setIsExpanded(false);
  };

  return (
    <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-primary">+</span>
          {teamLogo && <img src={teamLogo} alt="" className="w-5 h-5 object-contain" />}
          <span className="font-medium">
            {t('markets.createTournamentMarketForTeam', 'Tournament Market for {{team}}', {
              team: teamName,
            })}
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatedCollapse open={isExpanded}>
        <div className="px-4 pb-4">
          <DealerNFTSelector
            tokenIds={dealerTokenIds}
            selectedTokenId={selectedNFTTokenId}
            onSelect={setSelectedNFTTokenId}
          />
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            {/* Tournament Selector */}
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium mb-2">
                {t('markets.selectTournament', 'Select Tournament')}
              </label>
              <Select
                value={selectedTournamentId !== null ? String(selectedTournamentId) : undefined}
                onValueChange={val => setSelectedTournamentId(Number(val))}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t(
                      'markets.selectTournamentPlaceholder',
                      '-- Select a tournament --'
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {tournaments.map(tour => (
                    <SelectItem key={tour.id} value={String(tour.id)}>
                      {tour.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Expectation */}
            <div className="md:w-48">
              <label className="block text-sm font-medium mb-2">
                {t('market.condition.expectation', 'Expectation')}
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setExpectation('1')}
                  className={`flex-1 px-2 py-2 rounded-lg border text-xs font-medium transition-colors ${
                    expectation === '1'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {t('market.condition.wins', 'Wins')}
                </button>
                <button
                  type="button"
                  onClick={() => setExpectation('0')}
                  className={`flex-1 px-2 py-2 rounded-lg border text-xs font-medium transition-colors ${
                    expectation === '0'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {t('market.condition.doesNotWin', 'Does not win')}
                </button>
              </div>
            </div>

            {/* Deadline */}
            <div className="md:w-52">
              <label className="block text-sm font-medium mb-1">
                {t('markets.deadline', 'Deadline')}
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 ${ui.background.surface} text-sm`}
              />
              {deadline && !isDeadlineValid && (
                <p className="mt-1 text-xs text-red-500">
                  {t('markets.deadlineMinimum', 'Deadline must be at least 24 hours from now')}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="md:w-auto py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              {createMarket.isPending
                ? t('markets.creating', 'Creating...')
                : t('markets.create', 'Create')}
            </button>
          </div>

          {/* Preview */}
          {selectedTournament && (
            <div className={`mt-3 p-2.5 rounded-lg ${ui.background.muted}/50 text-sm`}>
              <span className="text-muted-foreground">{t('inlineCreateMarket.market')} </span>
              <span className="font-medium">
                {teamName}{' '}
                {expectation === '1'
                  ? t('inlineCreateMarket.wins')
                  : t('inlineCreateMarket.doesNotWin')}{' '}
                {season} {selectedTournament.name}
              </span>
            </div>
          )}
        </div>
      </AnimatedCollapse>
    </div>
  );
}

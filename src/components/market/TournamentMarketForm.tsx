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

interface TeamOption {
  id: number;
  name: string;
  logo?: string | null;
}

interface TournamentMarketFormProps {
  sportCode: SportCode;
  /** A stable game/league ID to encode as the oracleId */
  leagueId: number;
  season: number;
  leagueName: string;
  teams: TeamOption[];
  /** Pre-select a specific team (e.g. when rendered on a team detail page) */
  preselectedTeamId?: number;
}

export function TournamentMarketForm({
  sportCode,
  leagueId,
  season,
  leagueName,
  teams,
  preselectedTeamId,
}: TournamentMarketFormProps) {
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
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(preselectedTeamId ?? null);
  const [expectation, setExpectation] = useState<'1' | '0'>('1');
  const [deadline, setDeadline] = useState('');

  if (!isDealer) return null;

  const tokenId = selectedNFTTokenId;
  if (tokenId === undefined) return null;

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
  const canSubmit = selectedTeamId !== null && isDeadlineValid && !createMarket.isPending;

  const selectedTeam = teams.find(t => t.id === selectedTeamId);

  const handleSubmit = async () => {
    if (!canSubmit || !selectedTeamId || !deadlineDate) return;

    const oracleId = encodeOracleId(sportCode, leagueId);
    const chainDeadline = toChainDate(deadlineDate);
    const deadlineBigInt = BigInt(Math.floor(chainDeadline.getTime() / 1000));

    const conditionData = encodeConditionData({
      type: ConditionType.Tournament,
      teamId: selectedTeamId,
      expectation: expectation === '1',
    }) as `0x${string}`;

    const verb =
      expectation === '1' ? t('inlineCreateMarket.wins') : t('inlineCreateMarket.doesNotWin');
    const teamLabel = selectedTeam?.name ?? `Team #${selectedTeamId}`;
    const title = `${teamLabel} ${verb} ${season} ${leagueName}`;
    const desc = `${leagueName} ${season} — ${teamLabel} ${verb}`;

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
          <span className="font-medium">
            {t('markets.createTournamentMarket', 'Create Tournament Market')}
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
            {/* Team Selector */}
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium mb-2">
                {t('markets.selectTeam', 'Select Team')}
              </label>
              <Select
                value={selectedTeamId !== null ? String(selectedTeamId) : undefined}
                onValueChange={val => setSelectedTeamId(Number(val))}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('markets.selectTeamPlaceholder', '-- Select a team --')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {teams.map(team => (
                    <SelectItem key={team.id} value={String(team.id)}>
                      {team.name}
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
          {selectedTeam && (
            <div className={`mt-3 p-2.5 rounded-lg ${ui.background.muted}/50 text-sm`}>
              <span className="text-muted-foreground">{t('inlineCreateMarket.market')} </span>
              <span className="font-medium">
                {selectedTeam.name}{' '}
                {expectation === '1'
                  ? t('inlineCreateMarket.wins')
                  : t('inlineCreateMarket.doesNotWin')}{' '}
                {season} {leagueName}
              </span>
            </div>
          )}
        </div>
      </AnimatedCollapse>
    </div>
  );
}

// Config
export { initHeavymathUI, getAppConfig } from './config/app';
export type { HeavymathAppConfig } from './config/app';
export {
  supportedChains,
  defaultChain,
  CHAIN_IDS,
  getChainById,
  isSupportedChain,
} from './config/chains';
export {
  setContractAddresses,
  getContractAddresses,
  getContractAddress,
} from './config/contracts';
export type { ContractAddresses } from './config/contracts';
export {
  SPORT_CODES,
  getSportSlug,
  getSportCode,
  isSportCode,
  getSportEventUrl,
} from './config/sportCodes';
export type { SportCode, SportSlug } from './config/sportCodes';

// Types
export { AuthStatus } from './types/auth';
export type {
  WalletState,
  UserData,
  AuthMethod,
  PrivyAuthInfo,
} from './types/auth';
export { MarketStatus, statusStringToNumber, CATEGORIES } from './types/market';
export type {
  MarketStatusString,
  MarketSortOption,
  CreateMarketData,
  PlacePredictionData,
  UpdatePredictionData,
  Category,
} from './types/market';
export type {
  IndexerMarket,
  IndexerPrediction,
  IndexerMarketFilters,
} from './types/market';
export { PERMISSION_WILDCARD, hasPermission } from './types/dealer';
export type {
  DealerNFT,
  DealerPermission,
  DealerDashboard,
} from './types/dealer';

// Utilities
export {
  formatUSDC,
  parseUSDC,
  formatAddress,
  formatPercentage,
  formatTimeRemaining,
  formatDate,
  formatDealerFee,
} from './utils/format';
export {
  encodeOracleId,
  decodeOracleId,
  isValidSportsOracleId,
} from './utils/oracleId';
export { getOnChainMarketId } from './utils/marketId';
export {
  buildSeasonOptions,
  hasSeasonValue,
  formatSeasonLabel,
  normalizeSeasonSortValue,
  getNumericSeasonValue,
} from './utils/sportsSeason';
export type { SeasonOption } from './utils/sportsSeason';
export { getNow, toChainDate } from './utils/datetime';
export {
  ConditionType,
  ScoreType,
  TeamSide,
  ComparisonOperator,
  encodeConditionData,
  decodeConditionData,
  formatConditionDescription,
} from './utils/conditionData';
export type {
  ConditionData,
  ConditionTypeValue,
  ScoreTypeValue,
  TeamSideValue,
  ComparisonOperatorValue,
  WinLossCondition,
  MatchScoreCondition,
  TournamentCondition,
} from './utils/conditionData';
export { getMarketDisplayInfo } from './utils/marketDisplay';
export type { MarketDisplayInfo } from './utils/marketDisplay';

// Lib
export { EVMPredictionClient } from './lib/evmClient';

// Context
export {
  AuthProvider,
  useAuth,
  useWalletAuth,
} from './context/WalletAuthContext';
export { IndexerProvider, useIndexer } from './context/IndexerContext';

// Hooks (barrel)
export * from './hooks';

// Hooks - additional
export { useToastActions } from './hooks/useToastActions';
export { useDealerPermission } from './hooks/useDealerPermission';
export { useGameMarkets } from './hooks/useGameMarkets';
export { useLeagueMarkets } from './hooks/useLeagueMarkets';
export { useGameIdsWithMarkets } from './hooks/useFilteredSportsData';

// Components - Market
export {
  HeavymathUiTextProvider,
  useHeavymathUiText,
} from './components/HeavymathUiTextProvider';
export type { HeavymathUiTextMap } from './components/HeavymathUiTextProvider';
export { MarketCard } from './components/market/MarketCard';
export { MarketList } from './components/market/MarketList';
export { MarketStatusBadge } from './components/market/MarketStatusBadge';
export { PredictionSlider } from './components/market/PredictionSlider';
export { GameMarketsSection } from './components/market/GameMarketsSection';
export { LeagueMarketsSection } from './components/market/LeagueMarketsSection';
export { TeamMarketsSection } from './components/market/TeamMarketsSection';
export { InlineCreateMarketForm } from './components/market/InlineCreateMarketForm';
export { TournamentMarketForm } from './components/market/TournamentMarketForm';
export { TeamTournamentMarketForm } from './components/market/TeamTournamentMarketForm';
export { SportPredictionCard } from './components/market/SportPredictionCard';

// Components - Sports
export { SeasonSelector } from './components/sports/SeasonSelector';

// Components - UI
export { FavoriteStar } from './components/ui/FavoriteStar';
export { AnimatedCollapse } from './components/ui/AnimatedCollapse';

// Components - Wallet
export { WalletConnectionModal } from './components/wallet/WalletConnectionModal';
export { default as ConnectedWalletMenu } from './components/wallet/ConnectedWalletMenu';
export { ProtectedRoute } from './components/wallet/ProtectedRoute';
export { DealerRoute } from './components/wallet/DealerRoute';

// Components - Auth
export { SiweAuthGate } from './components/auth/SiweAuthGate';

// Components - Discussion
export { DiscussionSection } from './components/discussion';
export type { DiscussionSectionProps } from './components/discussion';

// Components - Icons
export * from './components/icons';

// Components - Dealer
export { DealerNFTList } from './components/dealer/DealerNFTList';
export { DealerNFTSelector } from './components/dealer/DealerNFTSelector';
export { UpcomingGamesWidget } from './components/dealer/UpcomingGamesWidget';

// Components - Writings
export { WritingsSection } from './components/writings';
export type {
  WritingsSectionProps,
  WritingsArticleConfig,
} from './components/writings';

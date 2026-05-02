// Config
export { initHeavymathUI, getAppConfig } from './config/app';
export type { HeavymathAppConfig } from './config/app';
export { supportedChains, defaultChain, CHAIN_IDS, getChainById, isSupportedChain } from './config/chains';
export { setContractAddresses, getContractAddresses, getContractAddress } from './config/contracts';
export type { ContractAddresses } from './config/contracts';
export { SPORT_CODES, getSportSlug, getSportCode, isSportCode, getSportEventUrl } from './config/sportCodes';
export type { SportCode, SportSlug } from './config/sportCodes';

// Types
export { AuthStatus } from './types/auth';
export type { WalletState, UserData } from './types/auth';
export { MarketStatus, statusStringToNumber, CATEGORIES } from './types/market';
export type { MarketStatusString, MarketSortOption, CreateMarketData, PlacePredictionData, UpdatePredictionData, Category } from './types/market';
export type { IndexerMarket, IndexerPrediction, IndexerMarketFilters } from './types/market';
export { PERMISSION_WILDCARD, hasPermission } from './types/dealer';
export type { DealerNFT, DealerPermission, DealerDashboard } from './types/dealer';

// Utilities
export { formatUSDC, parseUSDC, formatAddress, formatPercentage, formatTimeRemaining, formatDate, formatDealerFee } from './utils/format';
export { encodeOracleId, decodeOracleId, isValidSportsOracleId } from './utils/oracleId';
export { getOnChainMarketId } from './utils/marketId';
export { buildSeasonOptions, hasSeasonValue, formatSeasonLabel, normalizeSeasonSortValue, getNumericSeasonValue } from './utils/sportsSeason';
export type { SeasonOption } from './utils/sportsSeason';
export { getNow, toChainDate } from './utils/datetime';

// Lib
export { EVMPredictionClient } from './lib/evmClient';

// Context
export { AuthProvider, useAuth, useWalletAuth } from './context/WalletAuthContext';
export { IndexerProvider, useIndexer } from './context/IndexerContext';

// Hooks (barrel)
export * from './hooks';

// Components - Market
export { MarketCard } from './components/market/MarketCard';
export { MarketList } from './components/market/MarketList';
export { MarketStatusBadge } from './components/market/MarketStatusBadge';
export { PredictionSlider } from './components/market/PredictionSlider';
export { GameMarketsSection } from './components/market/GameMarketsSection';
export { LeagueMarketsSection } from './components/market/LeagueMarketsSection';
export { TeamMarketsSection } from './components/market/TeamMarketsSection';

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

// Components - Icons
export * from './components/icons';

// Components - Dealer
export { DealerNFTList } from './components/dealer/DealerNFTList';
export { DealerNFTSelector } from './components/dealer/DealerNFTSelector';
export { UpcomingGamesWidget } from './components/dealer/UpcomingGamesWidget';

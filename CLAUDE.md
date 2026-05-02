# @sudobility/heavymath_ui

Shared UI components, hooks, utilities, and contexts for Heavymath prediction market apps.

## Usage

```typescript
import { initHeavymathUI, setContractAddresses, AuthProvider, IndexerProvider } from '@sudobility/heavymath_ui';

// Initialize before rendering
initHeavymathUI({
  name: 'MyApp',
  indexerUrl: 'http://localhost:42079',
  defaultChainId: 11155111,
});

setContractAddresses(11155111, {
  predictionMarket: '0x...',
  dealerNFT: '0x...',
  oracleResolver: '0x...',
  usdc: '0x...',
});
```

## Package Manager

Bun (do not use npm/yarn/pnpm)

## Commands

```bash
bun run build        # tsc build to dist/
bun run typecheck    # Type check only
bun run clean        # Remove dist/
```

## Exports

### Config
- `initHeavymathUI(config)` — Initialize app config (must call before using components)
- `setContractAddresses(chainId, addresses)` — Configure contract addresses per chain
- `CHAIN_IDS`, `supportedChains`, `SPORT_CODES`

### Context Providers
- `AuthProvider` / `useAuth()` / `useWalletAuth()` — Wallet connection + dealer NFT status
- `IndexerProvider` / `useIndexer()` — IndexerClient singleton

### Hooks
- Contract: `usePlacePrediction`, `useClaimWinnings`, `useCreateMarket`, etc.
- Toast-wrapped: `usePlacePredictionWithToast`, etc.
- Market: `useGameMarkets`, `useLeagueMarkets`
- Dealer: `useDealerNFT`, `useDealerPermission`

### Components
- Market: `MarketCard`, `MarketList`, `PredictionSlider`, `GameMarketsSection`, `LeagueMarketsSection`, `TeamMarketsSection`
- Wallet: `WalletConnectionModal`, `ConnectedWalletMenu`, `ProtectedRoute`, `DealerRoute`
- Sports: `SeasonSelector`, `FavoriteStar`
- Dealer: `DealerNFTList`, `DealerNFTSelector`, `UpcomingGamesWidget`

### Utilities
- `formatUSDC`, `parseUSDC`, `formatAddress`, `formatDate`, `formatTimeRemaining`
- `encodeOracleId`, `decodeOracleId`
- `buildSeasonOptions`, `getNow`, `toChainDate`

### Types
- `AuthStatus`, `MarketStatus`, `CreateMarketData`, `PlacePredictionData`
- `DealerNFT`, `DealerPermission`, `ContractAddresses`

## Peer Dependencies

React 18+, wagmi 2+, viem 2+, @tanstack/react-query 5+, i18next, react-router-dom 7+, @sudobility/components, @sudobility/design, @sudobility/heavymath_* packages.

## Consuming Apps

- `heavymath_app` — Full prediction market app (10 sports)
- `wcprediction_app` — World Cup focused prediction market app

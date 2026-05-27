# CLAUDE.md - @sudobility/heavymath_ui

## Project Overview

`@sudobility/heavymath_ui` is a shared UI component library for Heavymath prediction market apps. It provides React components, hooks, context providers, utilities, and configuration for wallet authentication, prediction markets, dealer management, sports data display, and discussion features.

**Package**: `@sudobility/heavymath_ui` (v0.0.16, BUSL-1.1 license)
**Author**: John Huang

## Tech Stack

- **Language**: TypeScript 5.9 (strict mode, ES2020 target)
- **Runtime**: Bun
- **Package Manager**: Bun (do not use npm/yarn/pnpm)
- **Framework**: React 19
- **Styling**: Tailwind CSS with @sudobility/design tokens
- **Build**: tsc -> dist/
- **Test**: Vitest with unit tests
- **Web3**: wagmi 2, viem 2
- **i18n**: i18next (all UI strings use `useTranslation()` hook)

## Commands

```bash
bun run build           # tsc -> dist/
bun run build:watch     # Watch mode
bun run clean           # Remove dist/
bun run typecheck       # tsc --noEmit
bun run lint            # ESLint
bun run lint:fix        # ESLint auto-fix
bun run format          # Prettier
bun run format:check    # Prettier check
bun run test            # Vitest once
bun run test:watch      # Vitest watch
bun run verify          # typecheck + lint + test + format:check
bun run prepublishOnly  # clean + build
```

**Before committing**, run:
```bash
bun run verify
```

## Project Structure

```
src/
├── index.ts                # Barrel export
├── components/
│   ├── auth/               # SiweAuthGate
│   ├── dealer/             # DealerNFTList, DealerNFTSelector, UpcomingGamesWidget
│   ├── discussion/         # DiscussionSection, CommentThread, CommentItem, CommentComposer
│   ├── icons/              # Sport icons (re-exported from react-icons)
│   ├── market/             # MarketCard, MarketList, PredictionSlider, etc.
│   ├── sports/             # SeasonSelector
│   ├── ui/                 # FavoriteStar, AnimatedCollapse
│   └── wallet/             # WalletConnectionModal, ConnectedWalletMenu, routes
├── config/
│   ├── app.ts              # App initialization and config
│   ├── chains.ts           # Supported blockchain chains
│   ├── contracts.ts        # Contract addresses per chain
│   └── sportCodes.ts       # Sport constants (10 sports)
├── context/
│   ├── WalletAuthContext.tsx   # Wallet connection + dealer NFT status
│   └── IndexerContext.tsx      # IndexerClient singleton
├── hooks/                  # 13 React hooks
├── lib/
│   └── evmClient.ts        # EVMPredictionClient wrapper
├── types/
│   ├── auth.ts
│   ├── dealer.ts
│   └── market.ts
├── utils/
│   ├── format.ts           # USDC, address, percentage, time, date, dealer fee formatting
│   ├── conditionData.ts    # ConditionType, ScoreType, encode/decode/format
│   ├── datetime.ts         # getNow(), toChainDate()
│   ├── marketDisplay.ts    # getMarketDisplayInfo()
│   ├── marketId.ts         # getOnChainMarketId()
│   ├── oracleId.ts         # encodeOracleId(), decodeOracleId(), isValidSportsOracleId()
│   ├── sportsSeason.ts     # buildSeasonOptions(), hasSeasonValue(), formatSeasonLabel(), normalizeSeasonSortValue()
│   └── __tests__/          # Unit tests for utilities
└── dist/                   # Build output (gitignored)
```

## Components (24 total)

### Market (10)

- `MarketCard` - Individual prediction market card display
- `MarketList` - List of prediction markets
- `MarketStatusBadge` - Status indicator for markets
- `PredictionSlider` - Interactive slider for placing predictions
- `GameMarketsSection` - Markets associated with a specific game
- `LeagueMarketsSection` - Markets associated with a league
- `TeamMarketsSection` - Markets associated with a team
- `SportPredictionCard` - Sport-specific prediction card
- `TournamentMarketForm` - Form for creating tournament markets
- `TeamTournamentMarketForm` - Form for creating team tournament markets
- `InlineCreateMarketForm` - Inline market creation form

### Wallet (4)

- `WalletConnectionModal` - Modal for connecting wallets
- `ConnectedWalletMenu` - Dropdown menu for connected wallet
- `ProtectedRoute` - Route guard requiring wallet connection
- `DealerRoute` - Route guard requiring dealer NFT

### Auth (1)

- `SiweAuthGate` - Sign-In with Ethereum authentication gate

### Dealer (3)

- `DealerNFTList` - List of dealer NFTs
- `DealerNFTSelector` - Selector for dealer NFTs
- `UpcomingGamesWidget` - Widget showing upcoming games for market creation

### Sports (1)

- `SeasonSelector` - Season picker component

### UI (2)

- `FavoriteStar` - Toggleable favorite star icon
- `AnimatedCollapse` - Animated collapsible container

### Discussion (4)

- `DiscussionSection` - Top-level discussion container
- `CommentThread` - Threaded comment display
- `CommentItem` - Individual comment
- `CommentComposer` - Comment input/editor

### Icons (10)

Sport icons re-exported from react-icons.

## Config and Initialization

### App Initialization

```typescript
import { initHeavymathUI, setContractAddresses } from '@sudobility/heavymath_ui';

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

### Config Functions

- `initHeavymathUI(config)` - Initialize the library (must call before using components)
- `getAppConfig()` - Get current app configuration
- `setContractAddresses(chainId, addresses)` / `getContractAddresses(chainId)` / `getContractAddress(chainId, name)` - Contract address management

### Chain Config

- `supportedChains` - Array of supported chain objects
- `defaultChain` - Default chain object
- `CHAIN_IDS` - Chain ID constants
- `getChainById(chainId)` - Look up chain by ID
- `isSupportedChain(chainId)` - Check if chain is supported

### Sport Codes

- `SPORT_CODES` - Sport code constants (10 sports)
- `getSportSlug(code)` / `getSportCode(slug)` - Convert between code and slug
- `isSportCode(value)` - Type guard
- `getSportEventUrl(sport, eventId)` - Build sport event URL

## Context Providers

### AuthProvider

Provides wallet connection state and dealer NFT status.

```typescript
<AuthProvider>
  {/* children can use useAuth() and useWalletAuth() */}
</AuthProvider>
```

- `useAuth()` - Basic auth state
- `useWalletAuth()` - Wallet address, isConnected, isDealer, dealerTokenIds

### IndexerProvider

Provides IndexerClient singleton for data fetching.

```typescript
<IndexerProvider>
  {/* children can use useIndexer() */}
</IndexerProvider>
```

- `useIndexer()` - Returns `{ indexerClient }` for market and sports data

## Hooks (13)

### Contract Hooks

| Hook | File | Purpose |
|------|------|---------|
| `usePlacePrediction`, `useClaimWinnings`, `useCreateMarket`, etc. | `useMarketContract.ts` | Base contract interaction hooks |
| `usePlacePredictionWithToast`, etc. | `useContractWithToast.ts` | Contract hooks wrapped with toast notifications |

### Market Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useGameMarkets` | `useGameMarkets.ts` | Query markets for a specific game |
| `useLeagueMarkets` | `useLeagueMarkets.ts` | Query markets for a league |

### Dealer Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useDealerNFT` | `useDealerNFT.ts` | NFT minting operations |
| `useDealerPermission` | `useDealerPermission.ts` | Check dealer permissions |

### Other Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useFilteredSportsData` | `useFilteredSportsData.ts` | Filter sports data |
| `useToastActions` | `useToastActions.ts` | Toast feedback helpers for transactions |

## Key Types

### Auth Types (`types/auth.ts`)

- `AuthStatus` - Authentication state enum
- `WalletState` - Wallet connection state
- `UserData` - User profile data
- `PrivyAuthInfo` - Privy auth integration info

### Market Types (`types/market.ts`)

- `MarketStatus` - Market lifecycle state
- `CreateMarketData` - Data for creating a market
- `PlacePredictionData` - Data for placing a prediction
- `UpdatePredictionData` - Data for updating a prediction
- `Category` - Market category

### Dealer Types (`types/dealer.ts`)

- `DealerNFT` - NFT token data
- `DealerPermission` - Permission configuration
- `DealerDashboard` - Dashboard state
- `PERMISSION_WILDCARD` - Wildcard permission constant
- `hasPermission()` - Permission check utility

## Utilities

### Formatting (`utils/format.ts`)

- `formatUSDC(amount)` - Format USDC amounts
- `parseUSDC(value)` - Parse string to USDC amount
- `formatAddress(address)` - Truncate wallet address for display
- `formatPercentage(value)` - Format percentage values
- `formatTimeRemaining(timestamp)` - Human-readable time remaining
- `formatDate(timestamp)` - Format date for display
- `formatDealerFee(fee)` - Format dealer fee

### Oracle IDs (`utils/oracleId.ts`)

- `encodeOracleId(params)` - Encode oracle parameters to ID
- `decodeOracleId(id)` - Decode oracle ID to parameters
- `isValidSportsOracleId(id)` - Validate sports oracle ID

### Market IDs (`utils/marketId.ts`)

- `getOnChainMarketId(params)` - Compute on-chain market ID

### Season Utilities (`utils/sportsSeason.ts`)

- `buildSeasonOptions(seasons)` - Build season selector options
- `hasSeasonValue(options, value)` - Check if value exists in options
- `formatSeasonLabel(season)` - Format season for display
- `normalizeSeasonSortValue(value)` - Normalize for sorting

### Date/Time (`utils/datetime.ts`)

- `getNow()` - Current timestamp
- `toChainDate(date)` - Convert to on-chain date format

### Condition Data (`utils/conditionData.ts`)

- `ConditionType` - Market condition type constants
- `ScoreType` - Score type constants
- `encodeConditionData(params)` - Encode condition parameters
- `decodeConditionData(data)` - Decode condition data
- `formatConditionDescription(data)` - Human-readable condition description

### Market Display (`utils/marketDisplay.ts`)

- `getMarketDisplayInfo(market)` - Get display-ready market info

## Libraries

### EVMPredictionClient (`lib/evmClient.ts`)

Wraps smart contract calls via viem. Singleton cached per chainId.

## Dependencies

### Peer Dependencies (18)

Must be provided by the consuming app:

| Package | Purpose |
|---------|---------|
| `react`, `react-dom` | React framework |
| `wagmi`, `viem` | Web3 wallet connectivity |
| `@tanstack/react-query` | Data fetching/caching layer |
| `react-router-dom` | Routing |
| `i18next`, `react-i18next` | Internationalization |
| `react-icons` | Icon library |
| `recharts` | Chart components |
| `@heroicons/react` | Heroicons |
| `@sudobility/components` | Shared base components |
| `@sudobility/design` | Design tokens |
| `@sudobility/di` | Dependency injection |
| `@sudobility/types` | Core shared types |
| `@sudobility/web3-components` | Web3 UI components |
| `@sudobility/heavymath_contracts` | Contract ABIs and types |
| `@sudobility/heavymath_indexer_client` | IndexerClient, hooks, market/sports data |
| `@sudobility/heavymath_lib` | Sports data hooks with favorites |
| `@sudobility/heavymath_types` | Shared type definitions |

### Direct Dependencies

- `react-markdown` - Markdown rendering (used in discussions)
- `rehype-sanitize` - HTML sanitization for markdown

## Consuming Apps

- `heavymath_app` - Full prediction market app (10 sports)
- `wcprediction_app` - World Cup focused prediction market app

## Coding Patterns

### Config Initialization

Libraries must call `initHeavymathUI()` + `setContractAddresses()` before rendering any components. Use `getAppConfig()` to read config at runtime.

### Provider + Hook Pattern

Context providers wrap the app; hooks consume the context:
```typescript
<AuthProvider>
  <IndexerProvider>
    {/* useAuth(), useWalletAuth(), useIndexer() available here */}
  </IndexerProvider>
</AuthProvider>
```

### Hook Composition

Base contract hooks provide raw functionality. Toast-wrapped variants layer on user feedback:
- `usePlacePrediction` (base) -> `usePlacePredictionWithToast` (with toast notifications)

### Singleton Pattern

`EVMPredictionClient` is cached per chainId -- one instance per chain, reused across components.

### Internationalization

All UI strings go through i18next `useTranslation()` hook. Never hardcode user-visible strings.

### Styling

Tailwind CSS with `@sudobility/design` tokens. Follow existing class patterns in components.

### Enum Convention

Use `as const` objects for enums, not TypeScript `enum` keyword:
```typescript
const MarketStatus = { OPEN: 'open', CLOSED: 'closed' } as const;
```

### React Query Cache Invalidation

Use staggered cache invalidation (0ms, 5s, 12s, 20s, 30s) to account for indexer lag when data is written on-chain but takes time to be indexed.

## Build and Publish

```bash
bun run clean && bun run build    # Manual build
bun publish                       # Runs prepublishOnly automatically (clean + build)
```

Output goes to `dist/` with `.js`, `.d.ts`, and `.d.ts.map` files.

## Ecosystem Context

```
heavymath_contracts       (smart contracts, ABIs)
       |
heavymath_indexer         (REST API, sports proxy)
       |
heavymath_indexer_client  (IndexerClient, React Query hooks)
       |
heavymath_lib             (sports + favorites merging)
       |
heavymath_ui              <-- YOU ARE HERE (shared UI components, hooks, contexts)
       |
heavymath_app / wcprediction_app  (consuming apps)
```

This library provides the UI layer: components, hooks, contexts, and utilities that consuming apps compose into full pages. It depends on the indexer client and lib for data, and on contracts for on-chain interactions.

/**
 * @fileoverview Authentication type definitions
 * @description Types for wallet connection state, authentication status, and user data.
 * Uses `as const` objects instead of enums due to `erasableSyntaxOnly` in tsconfig.
 */

import type { Address } from 'viem';

/**
 * Authentication status constants.
 * Tracks the progression of wallet connection and verification.
 */
export const AuthStatus = {
  Disconnected: 'DISCONNECTED',
  Connecting: 'CONNECTING',
  Connected: 'CONNECTED',
  Verified: 'VERIFIED',
  Error: 'ERROR',
} as const;

/** Union type of all possible authentication status values */
export type AuthStatus = (typeof AuthStatus)[keyof typeof AuthStatus];

/**
 * Represents the current wallet connection state.
 */
export interface WalletState {
  /** The connected wallet address, or undefined if disconnected */
  address: Address | undefined;
  /** The currently selected chain ID, or undefined if disconnected */
  chainId: number | undefined;
  /** Whether a wallet is currently connected */
  isConnected: boolean;
  /** Current authentication status */
  status: AuthStatus;
}

/**
 * User data including dealer status derived from on-chain NFT ownership.
 */
export interface UserData {
  /** The user's wallet address */
  address: Address;
  /** Whether the user owns a Dealer NFT */
  isDealer: boolean;
  /** Token IDs of Dealer NFTs owned by the user */
  dealerTokenIds: bigint[];
}

/** How the user authenticated: direct wallet connection or via a social/email provider */
export type AuthMethod = 'wallet' | 'privy';

/**
 * Information about a Privy-authenticated session.
 * Passed from the consuming app to AuthProvider so heavymath_ui
 * stays Privy-agnostic (no @privy-io imports).
 */
export interface PrivyAuthInfo {
  /** Whether user is authenticated via Privy (email/social) */
  isAuthenticated: boolean;
  /** Auth method used */
  authMethod: AuthMethod;
  /** Display label, e.g. email address or "Google" */
  userDisplayName?: string;
  /** Privy logout function */
  logout: () => Promise<void>;
}

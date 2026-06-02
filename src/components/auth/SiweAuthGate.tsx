/**
 * SiweAuthGate - Automatically triggers SIWE authentication when wallet connects.
 * Must be placed below both AuthProvider and IndexerProvider in the component tree.
 *
 * When the wallet connects and no valid JWT exists in the auth store,
 * this component silently initiates the SIWE flow:
 * 1. Fetches nonce from server
 * 2. Constructs SIWE message
 * 3. Prompts user to sign
 * 4. Verifies signature with server
 * 5. Stores JWT in auth store
 */

import { useEffect, useRef } from 'react';
import { useSignMessage } from 'wagmi';
import { useAuth } from '../../context/WalletAuthContext';
import { useIndexer } from '../../context/IndexerContext';
import { useAuthStore } from '@sudobility/heavymath_indexer_client';
import { useHeavymathUiText } from '../HeavymathUiTextProvider';

export function SiweAuthGate({ children }: { children: React.ReactNode }) {
  const text = useHeavymathUiText();
  const { address, isConnected } = useAuth();
  const { indexerClient } = useIndexer();
  const { signMessageAsync } = useSignMessage();
  const {
    isAuthenticated,
    address: storedAddress,
    setSession,
    clearSession,
  } = useAuthStore();

  const isAuthenticating = useRef(false);

  useEffect(() => {
    // Clear session if wallet disconnected
    if (!isConnected) {
      if (storedAddress) {
        clearSession();
      }
      return;
    }

    // Clear session if address changed
    if (address && storedAddress && address.toLowerCase() !== storedAddress) {
      clearSession();
    }

    // Skip if already authenticated or already in progress
    if (isAuthenticated() || isAuthenticating.current || !address) {
      return;
    }

    const authenticate = async () => {
      isAuthenticating.current = true;
      try {
        // 1. Get nonce
        const nonceResponse = await indexerClient.getNonce();
        const nonce = nonceResponse.data?.nonce;
        if (!nonce) return;

        // 2. Construct SIWE message
        const domain = globalThis.location?.hostname || 'heavymath.io';
        const origin = globalThis.location?.origin || 'https://heavymath.io';
        const message = [
          `${domain} wants you to sign in with your Ethereum account:`,
          address,
          '',
          text('auth.siweStatement'),
          '',
          `URI: ${origin}`,
          `Version: 1`,
          `Chain ID: 1`,
          `Nonce: ${nonce}`,
          `Issued At: ${new Date().toISOString()}`,
        ].join('\n');

        // 3. Sign message
        const signature = await signMessageAsync({ message });

        // 4. Verify with server
        const verifyResponse = await indexerClient.verifySiwe(
          message,
          signature
        );
        if (verifyResponse.data) {
          setSession(
            verifyResponse.data.token,
            verifyResponse.data.address,
            verifyResponse.data.expiresAt
          );
        }
        // 5. Auto-drip ETH if balance is low
        try {
          const baseUrl = indexerClient['baseUrl'] as string;
          const resp = await fetch(`${baseUrl}/api/faucet/eth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: address.toLowerCase() }),
          });
          if (resp.ok) {
            console.debug('[SiweAuthGate] ETH faucet drip sent');
          }
        } catch {
          // Silently fail — faucet is optional
        }
      } catch (error) {
        // User rejected signature or network error — silently fail
        console.debug('[SiweAuthGate] Authentication skipped:', error);
      } finally {
        isAuthenticating.current = false;
      }
    };

    authenticate();
  }, [
    address,
    isConnected,
    storedAddress,
    isAuthenticated,
    indexerClient,
    signMessageAsync,
    setSession,
    clearSession,
  ]);

  return <>{children}</>;
}

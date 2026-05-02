import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSwitchChain,
  useSignMessage,
  useReadContract,
  useReadContracts,
} from 'wagmi';
import { AuthStatus } from '../types/auth';
import type { AuthMethod, PrivyAuthInfo } from '../types/auth';
import type { Address } from 'viem';
import { erc721Abi } from 'viem';
import { getContractAddress } from '../config/contracts';

const STORAGE_KEY = 'heavymath_verified';

const tokenOfOwnerByIndexAbi = [
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

interface AuthContextType {
  // Wallet state
  address: Address | undefined;
  chainId: number | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  isVerified: boolean;
  status: AuthStatus;

  // Dealer state (placeholder - will be populated from indexer)
  isDealer: boolean;
  dealerTokenIds: bigint[];

  // Auth method info
  authMethod: AuthMethod;
  userDisplayName?: string;

  // Actions
  connect: () => void;
  disconnect: () => void;
  switchChain: (chainId: number) => void;
  signVerificationMessage: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  /** Optional Privy auth info -- when provided, social/email login skips sign-to-verify */
  privyAuth?: PrivyAuthInfo;
}

export function AuthProvider({ children, privyAuth }: AuthProviderProps) {
  const {
    address,
    chainId,
    isConnected,
    isConnecting,
    status: wagmiStatus,
  } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain: wagmiSwitchChain } = useSwitchChain();
  const { signMessageAsync } = useSignMessage();

  // Version counter to trigger re-computation of isVerified after signing
  const [verificationVersion, setVerificationVersion] = useState(0);

  // Compute isVerified from localStorage (derived state, not effect-based)
  // For Privy-authenticated users, skip localStorage check
  const isVerified = useMemo(() => {
    // verificationVersion is used to trigger re-computation after signing
    void verificationVersion;
    if (!address) return false;
    if (privyAuth?.isAuthenticated && isConnected) return true;
    const storedAddress = localStorage.getItem(STORAGE_KEY);
    return storedAddress === address;
  }, [address, verificationVersion, privyAuth?.isAuthenticated, isConnected]);

  // Map wagmi status to our AuthStatus
  const status = useMemo(() => {
    if (isConnecting) return AuthStatus.Connecting;
    if (isConnected && isVerified) return AuthStatus.Verified;
    if (isConnected) return AuthStatus.Connected;
    if (wagmiStatus === 'reconnecting') return AuthStatus.Connecting;
    return AuthStatus.Disconnected;
  }, [isConnected, isConnecting, isVerified, wagmiStatus]);

  // Connect handler - uses first available connector
  const handleConnect = () => {
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  // Disconnect handler
  const handleDisconnect = useCallback(() => {
    disconnect();
    localStorage.removeItem(STORAGE_KEY);
    setVerificationVersion(v => v + 1);
    if (privyAuth?.isAuthenticated) {
      privyAuth.logout().catch(console.error);
    }
  }, [disconnect, privyAuth]);

  // Sign verification message
  const signVerificationMessage = useCallback(async (): Promise<boolean> => {
    if (!address) return false;

    try {
      const message = `Welcome to HeavyMath!\n\nSign this message to verify your wallet ownership.\n\nWallet: ${address}\nTimestamp: ${Date.now()}`;

      await signMessageAsync({ message });

      // Store verified address and trigger re-computation
      localStorage.setItem(STORAGE_KEY, address);
      setVerificationVersion(v => v + 1);

      return true;
    } catch (error) {
      console.error('Signing failed:', error);
      return false;
    }
  }, [address, signMessageAsync]);

  // Switch chain handler
  const handleSwitchChain = (targetChainId: number) => {
    wagmiSwitchChain({ chainId: targetChainId });
  };

  // Check dealer status on-chain via ERC721 balanceOf
  const dealerNFTAddress = chainId
    ? getContractAddress(chainId, 'dealerNFT')
    : undefined;
  const { data: nftBalance } = useReadContract({
    address: dealerNFTAddress,
    abi: erc721Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!dealerNFTAddress,
    },
  });
  const isDealer = (nftBalance ?? 0n) > 0n;

  // Enumerate dealer token IDs via ERC721Enumerable.tokenOfOwnerByIndex
  const balanceCount = Number(nftBalance ?? 0n);

  const tokenIdContracts = useMemo(() => {
    if (!address || !dealerNFTAddress || balanceCount === 0) return [];
    return Array.from({ length: balanceCount }, (_, i) => ({
      address: dealerNFTAddress,
      abi: tokenOfOwnerByIndexAbi,
      functionName: 'tokenOfOwnerByIndex' as const,
      args: [address, BigInt(i)] as const,
    }));
  }, [address, dealerNFTAddress, balanceCount]);

  const { data: tokenIdResults } = useReadContracts({
    contracts: tokenIdContracts,
    query: {
      enabled: tokenIdContracts.length > 0,
    },
  });

  const dealerTokenIds: bigint[] = useMemo(() => {
    if (!tokenIdResults) return [];
    return tokenIdResults
      .filter(r => r.status === 'success' && r.result !== undefined)
      .map(r => r.result as bigint);
  }, [tokenIdResults]);

  const value: AuthContextType = {
    address,
    chainId,
    isConnected,
    isConnecting,
    isVerified,
    status,
    isDealer,
    dealerTokenIds,
    authMethod: privyAuth?.isAuthenticated ? privyAuth.authMethod : 'wallet',
    userDisplayName: privyAuth?.isAuthenticated
      ? privyAuth.userDisplayName
      : undefined,
    connect: handleConnect,
    disconnect: handleDisconnect,
    switchChain: handleSwitchChain,
    signVerificationMessage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/** Alias for useAuth — used by apps that have a separate Firebase AuthContext */
export const useWalletAuth = useAuth;

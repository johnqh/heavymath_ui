import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAccount, useConnect, useDisconnect, type Connector } from 'wagmi';
import { ChainType } from '@sudobility/types';
import { Modal, Logo } from '@sudobility/components';
import { WalletIcon, WalletConnectScreen, WalletVerifyScreen } from '@sudobility/web3-components';
import type { WalletOption } from '@sudobility/web3-components';
import { useAuth } from '../../context/WalletAuthContext';
import { AuthStatus } from '../../types/auth';
import { getAppConfig } from '../../config/app';

// Detect if browser supports extensions (Safari doesn't, Chrome/Firefox/Edge do)
const supportsExtensions = () => {
  if (typeof navigator === 'undefined') return true; // Assume support on server

  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|iphone|ipad|mobile|tablet/i.test(userAgent);

  // Mobile browsers don't support extensions (except Kiwi/Firefox mobile, but we'll simplify)
  if (isMobile) return false;

  // Safari doesn't support standard Web Extensions API that crypto wallets use
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  return !isSafari;
};

// Detect if desktop browser has a built-in wallet (Brave, Opera)
const hasDesktopBrowserWallet = () => {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|iphone|ipad|mobile|tablet/i.test(userAgent);

  // Only check on desktop
  if (isMobile) return false;

  const windowObj = window as unknown as {
    ethereum?: { isBraveWallet?: boolean; isOpera?: boolean };
  };

  // Check for Brave Wallet
  const hasBraveWallet = !!(
    windowObj.ethereum?.isBraveWallet ||
    (navigator as unknown as { brave?: { isBrave?: boolean } }).brave?.isBrave
  );

  // Check for Opera Wallet
  const hasOperaWallet = !!(
    windowObj.ethereum?.isOpera ||
    userAgent.includes('opr/') ||
    userAgent.includes('opera')
  );

  return hasBraveWallet || hasOperaWallet;
};

// Helper to get connector display name
const getConnectorName = (connector: Connector): string => {
  if (connector.id === 'metaMask' || connector.id === 'io.metamask') {
    return 'MetaMask';
  }
  if (connector.id === 'coinbaseWalletSDK' || connector.id === 'coinbaseWallet') {
    return 'Coinbase Wallet';
  }
  if (connector.id === 'walletConnect') {
    return 'WalletConnect';
  }
  if (connector.id === 'injected') {
    return 'Browser Wallet';
  }
  if (connector.name === 'MetaMask') return 'MetaMask';
  if (connector.name === 'WalletConnect') return 'WalletConnect';
  if (connector.name === 'Coinbase Wallet') return 'Coinbase Wallet';
  if (connector.name === 'Injected' || connector.name === 'Browser Wallet') {
    return 'Browser Wallet';
  }
  return connector.name || 'Unknown Wallet';
};

interface WalletConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletConnectionModal({ isOpen, onClose }: WalletConnectionModalProps) {
  const { lang } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('connectWalletPage');
  const { address, status, signVerificationMessage } = useAuth();
  const { connectors, connect } = useConnect();
  const { connector: activeConnector } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  const [step, setStep] = useState<'connect' | 'sign'>('connect');
  const [error, setError] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [connectedWalletProvider, setConnectedWalletProvider] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ethereum' | 'solana'>('ethereum');
  const [browserSupportsExtensions] = useState(supportsExtensions);
  const [hasDesktopWallet] = useState(hasDesktopBrowserWallet);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('connect');
      setError(null);
      setIsSigning(false);
      setConnectingWallet(null);
      setConnectedWalletProvider(null);
      setActiveTab('ethereum');
    }
  }, [isOpen]);

  // Handle navigation based on status
  useEffect(() => {
    if (!isOpen) return;

    if (status === AuthStatus.Verified) {
      onClose();
      navigate(`/${lang}/wallet`);
    } else if (status === AuthStatus.Connected && step !== 'sign') {
      setStep('sign');
      if (activeConnector) {
        setConnectedWalletProvider(getConnectorName(activeConnector));
      }
      setConnectingWallet(null);
    } else if (status === AuthStatus.Disconnected && step !== 'connect') {
      setStep('connect');
      setConnectingWallet(null);
      setConnectedWalletProvider(null);
    }
  }, [status, navigate, step, lang, activeConnector, isOpen, onClose]);

  // Reset connection
  const resetConnection = useCallback(async () => {
    try {
      await wagmiDisconnect();
      setStep('connect');
      setError(null);
      setIsSigning(false);
      setConnectingWallet(null);
      setConnectedWalletProvider(null);
    } catch (err) {
      console.error('Error resetting connection:', err);
      setStep('connect');
      setError(null);
      setConnectingWallet(null);
      setConnectedWalletProvider(null);
    }
  }, [wagmiDisconnect]);

  // Store connectors in a ref to avoid dependency issues
  const connectorsRef = useRef(connectors);
  connectorsRef.current = connectors;

  // Handle wallet selection - stable reference
  const handleWalletSelect = useCallback(
    async (walletName: string, connectorIndex: number) => {
      setError(null);
      setConnectingWallet(walletName);

      try {
        const connector = connectorsRef.current[connectorIndex];
        await connect({ connector });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message.toLowerCase() : '';
        const isCancellation =
          errorMessage.includes('user rejected') ||
          errorMessage.includes('user denied') ||
          errorMessage.includes('cancelled') ||
          errorMessage.includes('canceled');

        if (isCancellation) {
          setConnectingWallet(null);
          setError(null);
        } else {
          console.error('Failed to connect wallet:', err);
          setConnectingWallet(null);
          setError(t('errors.failedToConnect', 'Failed to connect wallet. Please try again.'));
        }
      }
    },
    [connect, t]
  );

  // Build stable wallet options - only rebuild when connectors array identity changes
  const walletOptionsBase = useMemo(() => {
    const seenWallets = new Set<string>();
    const uniqueConnectors = connectors.filter(connector => {
      const walletName = getConnectorName(connector);

      // Only show Browser Wallet on desktop when browser has built-in wallet
      if (walletName === 'Browser Wallet') {
        if (!hasDesktopWallet) {
          return false;
        }
      }

      // If browser doesn't support extensions, only show WalletConnect
      if (!browserSupportsExtensions && walletName !== 'WalletConnect') {
        return false;
      }

      // Skip duplicates
      if (seenWallets.has(walletName)) return false;
      seenWallets.add(walletName);
      return true;
    });

    // Sort: Browser Wallet first (if desktop), MetaMask second, Coinbase third, WalletConnect last
    const sortedConnectors = [...uniqueConnectors].sort((a, b) => {
      const nameA = getConnectorName(a);
      const nameB = getConnectorName(b);

      // Browser Wallet always first (only on desktop when detected)
      if (hasDesktopWallet) {
        if (nameA === 'Browser Wallet') return -1;
        if (nameB === 'Browser Wallet') return 1;
      }

      // MetaMask second
      if (nameA === 'MetaMask') return -1;
      if (nameB === 'MetaMask') return 1;

      // Coinbase Wallet third
      if (nameA === 'Coinbase Wallet') return -1;
      if (nameB === 'Coinbase Wallet') return 1;

      // WalletConnect always last
      if (nameA === 'WalletConnect') return 1;
      if (nameB === 'WalletConnect') return -1;

      return 0;
    });

    return sortedConnectors.map(connector => {
      const walletName = getConnectorName(connector);
      const originalIndex = connectors.indexOf(connector);
      return {
        id: connector.id,
        name: walletName,
        available: true,
        chainType: 'evm' as const,
        connector,
        originalIndex,
      };
    });
  }, [connectors, hasDesktopWallet, browserSupportsExtensions]);

  // Build final wallet options with connecting state and click handlers
  const evmWallets: WalletOption[] = useMemo(() => {
    return walletOptionsBase.map(wallet => ({
      id: wallet.id,
      name: wallet.name,
      available: wallet.available,
      connecting: connectingWallet === wallet.name,
      chainType: wallet.chainType,
      connector: wallet.connector,
      onClick: () => handleWalletSelect(wallet.name, wallet.originalIndex),
    }));
  }, [walletOptionsBase, connectingWallet, handleWalletSelect]);

  // Build Solana wallet options
  const solanaWallets: WalletOption[] = useMemo(
    () => [
      {
        id: 'phantom',
        name: t('walletNames.phantom', 'Phantom'),
        available: true,
        connecting: connectingWallet === 'Phantom',
        chainType: 'solana' as const,
        onClick: () => {
          // Solana wallet connection not implemented yet
          setError(t('errors.solanaNotSupported', 'Solana wallet connection coming soon'));
        },
      },
      {
        id: 'solflare',
        name: t('walletNames.solflare', 'Solflare'),
        available: true,
        connecting: connectingWallet === 'Solflare',
        chainType: 'solana' as const,
        onClick: () => {
          // Solana wallet connection not implemented yet
          setError(t('errors.solanaNotSupported', 'Solana wallet connection coming soon'));
        },
      },
    ],
    [t, connectingWallet]
  );

  // Handle sign message
  const handleSignMessage = async () => {
    setIsSigning(true);
    setError(null);

    try {
      const signed = await signVerificationMessage();

      if (signed) {
        onClose();
        navigate(`/${lang}/wallet`);
      } else {
        setError(t('errors.defaultSigningError', 'Failed to sign message. Please try again.'));
      }
    } catch (err: unknown) {
      console.error('Signing error:', err);
      const errorString = err instanceof Error ? err.message.toLowerCase() : '';

      if (
        errorString.includes('rejected') ||
        errorString.includes('cancelled') ||
        errorString.includes('canceled') ||
        errorString.includes('denied')
      ) {
        setError(t('errors.signingCanceled', 'Signing was canceled. Please try again.'));
      } else {
        setError(t('errors.defaultSigningError', 'Failed to sign message. Please try again.'));
      }
    } finally {
      setIsSigning(false);
    }
  };

  const handleClose = () => {
    // If connected but not verified, disconnect before closing
    if (status === AuthStatus.Connected) {
      wagmiDisconnect();
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="medium"
      variant="web3wallet"
      showCloseButton={true}
      closeOnOverlayClick={true}
      closeOnEscape={true}
    >
      <div className="p-6">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo size="lg" logoText={getAppConfig().name} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
            {step === 'sign' && connectedWalletProvider && activeConnector && (
              <WalletIcon
                wallet={connectedWalletProvider}
                connector={activeConnector}
                className="w-8 h-8"
              />
            )}
            {step === 'connect'
              ? t('pageTitle.connect', 'Connect Your Wallet')
              : t('pageTitle.verify', 'Verify Your Wallet')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {step === 'connect'
              ? t('pageDescription.connect', 'Choose your preferred wallet to connect')
              : t('pageDescription.verify', 'Sign the message to authenticate your identity')}
          </p>
        </div>

        {step === 'connect' ? (
          <WalletConnectScreen
            evmWallets={evmWallets}
            solanaWallets={solanaWallets}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            connectingWallet={connectingWallet}
            isAutoConnecting={false}
            error={error}
            browserSupportsExtensions={browserSupportsExtensions}
            labels={{
              ethereum: t('tabLabels.ethereum', 'Ethereum'),
              solana: t('tabLabels.solana', 'Solana'),
              available: t('walletStatus.available', 'Available'),
              notAvailable: t('walletStatus.notAvailable', 'Not Available'),
              noWalletText: t('noWalletLinks.noWallet', "Don't have a wallet?"),
              installMetaMask: t('noWalletLinks.installMetaMask', 'Install MetaMask'),
              installPhantom: t('noWalletLinks.installPhantom', 'Install Phantom'),
              autoConnectTitle: t('walletBrowserAutoConnect.title', 'Connecting to your wallet...'),
              autoConnectDescription: t(
                'walletBrowserAutoConnect.description',
                'We detected you are using a wallet browser. Automatically connecting...'
              ),
              extensionsNotSupported: t(
                'browserCompatibility.extensionsNotSupported',
                'Solana wallets require browser extension support'
              ),
              useChromeForSolana: t(
                'browserCompatibility.useChromeForSolana',
                'Please use Chrome, Firefox, or Edge to connect Solana wallets'
              ),
            }}
          />
        ) : (
          <WalletVerifyScreen
            walletAddress={address || ''}
            chainType={ChainType.EVM}
            walletProvider={connectedWalletProvider || undefined}
            walletConnector={activeConnector}
            isSigning={isSigning}
            error={error}
            onSign={handleSignMessage}
            onUseDifferentWallet={resetConnection}
            labels={{
              pageTitle: t('pageTitle.verify', 'Verify Your Wallet'),
              pageDescription: t(
                'pageDescription.verify',
                'Sign the message to authenticate your identity'
              ),
              connectedWalletLabel: t(
                'verificationSection.connectedWalletLabel',
                'Connected wallet:'
              ),
              ethereumChainLabel: t('verificationSection.ethereumChainLabel', 'Ethereum'),
              solanaChainLabel: t('verificationSection.solanaChainLabel', 'Solana'),
              signInEthereumTitle: t(
                'verificationSection.signInEthereumTitle',
                'Sign-In with Ethereum'
              ),
              signInEthereumDescription: t(
                'verificationSection.signInEthereumDescription',
                "You'll be asked to sign a message to prove ownership of your wallet. This is gasless and secure."
              ),
              signInSolanaTitle: t('verificationSection.signInSolanaTitle', 'Sign-In with Solana'),
              signInSolanaDescription: t(
                'verificationSection.signInSolanaDescription',
                "You'll be asked to sign a message to prove ownership of your wallet. This is gasless and secure."
              ),
              signMessageButton: t('verificationSection.signMessageButton', 'Sign Message'),
              signingButton: t('verificationSection.signingButton', 'Signing...'),
              useDifferentWallet: t(
                'verificationSection.useDifferentWallet',
                'Use a different wallet'
              ),
            }}
          />
        )}
      </div>
    </Modal>
  );
}

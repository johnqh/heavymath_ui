import { type FC, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ClipboardDocumentIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  StarIcon,
  BriefcaseIcon,
  TicketIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import {
  AuthStatus as SudobilityAuthStatus,
  ChainType,
} from '@sudobility/types';
import { WalletDropdownMenu } from '@sudobility/web3-components';
import { AuthStatus } from '../../types/auth';
import { useHeavymathUiText } from '../HeavymathUiTextProvider';

interface ConnectedWalletMenuProps {
  walletAddress: string;
  authStatus: AuthStatus;
  onDisconnect: () => void;
}

/**
 * ConnectedWalletMenu - Wallet dropdown menu component
 *
 * Displays wallet address, status badges, and a dropdown menu with actions
 * like copy address, profile, favorites, dealer, bets, and disconnect.
 */
const ConnectedWalletMenu: FC<ConnectedWalletMenuProps> = ({
  walletAddress,
  authStatus,
  onDisconnect,
}) => {
  const text = useHeavymathUiText();
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();

  const handleCopyAddress = useCallback(async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  }, [walletAddress]);

  const handleProfile = useCallback(() => {
    navigate(`/${lang}/profile`);
  }, [navigate, lang]);

  const handleFavorites = useCallback(() => {
    navigate(`/${lang}/favorites`);
  }, [navigate, lang]);

  const handleDealer = useCallback(() => {
    navigate(`/${lang}/dealer`);
  }, [navigate, lang]);

  const handlePortfolio = useCallback(() => {
    navigate(`/${lang}/portfolio`);
  }, [navigate, lang]);

  const handleSettings = useCallback(() => {
    navigate(`/${lang}/settings`);
  }, [navigate, lang]);

  const handleDisconnect = useCallback(() => {
    onDisconnect();
    navigate(`/${lang}`);
  }, [onDisconnect, navigate, lang]);

  const menuItems = useMemo(
    () => [
      {
        id: 'copy-address',
        label: text('wallet.copyAddress'),
        icon: ClipboardDocumentIcon,
        onClick: handleCopyAddress,
      },
      {
        id: 'separator-1',
        label: '',
        onClick: () => {},
        separator: true,
      },
      {
        id: 'profile',
        label: text('wallet.profile'),
        icon: UserIcon,
        onClick: handleProfile,
      },
      {
        id: 'favorites',
        label: text('wallet.favorites'),
        icon: StarIcon,
        onClick: handleFavorites,
      },
      {
        id: 'dealer',
        label: text('wallet.dealer'),
        icon: BriefcaseIcon,
        onClick: handleDealer,
      },
      {
        id: 'portfolio',
        label: text('wallet.portfolio'),
        icon: TicketIcon,
        onClick: handlePortfolio,
      },
      {
        id: 'settings',
        label: text('wallet.settings'),
        icon: Cog6ToothIcon,
        onClick: handleSettings,
      },
      {
        id: 'separator-2',
        label: '',
        onClick: () => {},
        separator: true,
      },
      {
        id: 'disconnect',
        label: text('buttons.disconnect'),
        icon: ArrowRightOnRectangleIcon,
        onClick: handleDisconnect,
      },
    ],
    [
      text,
      handleCopyAddress,
      handleProfile,
      handleFavorites,
      handleDealer,
      handlePortfolio,
      handleSettings,
      handleDisconnect,
    ]
  );

  // Map our AuthStatus to @sudobility/types AuthStatus
  const mappedAuthStatus = useMemo(() => {
    switch (authStatus) {
      case AuthStatus.Verified:
        return SudobilityAuthStatus.VERIFIED;
      case AuthStatus.Connected:
        return SudobilityAuthStatus.CONNECTED;
      default:
        return SudobilityAuthStatus.DISCONNECTED;
    }
  }, [authStatus]);

  return (
    <WalletDropdownMenu
      walletAddress={walletAddress}
      authStatus={mappedAuthStatus}
      chainType={ChainType.EVM}
      menuItems={menuItems}
      statusLabels={{
        verified: text('wallet.statusVerified'),
        connected: text('wallet.statusConnected'),
        disconnected: text('wallet.statusDisconnected'),
      }}
    />
  );
};

export default ConnectedWalletMenu;

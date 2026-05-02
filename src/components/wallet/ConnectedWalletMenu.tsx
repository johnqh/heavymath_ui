import { type FC, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import {
  ClipboardDocumentIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  StarIcon,
  BriefcaseIcon,
  TicketIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import {
  AuthStatus as SudobilityAuthStatus,
  ChainType,
} from "@sudobility/types";
import { WalletDropdownMenu } from "@sudobility/web3-components";
import { AuthStatus } from "../../types/auth";

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
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();

  const handleCopyAddress = useCallback(async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
      } catch (error) {
        console.error("Failed to copy address:", error);
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
        id: "copy-address",
        label: t("wallet.copyAddress", "Copy Address"),
        icon: ClipboardDocumentIcon,
        onClick: handleCopyAddress,
      },
      {
        id: "separator-1",
        label: "",
        onClick: () => {},
        separator: true,
      },
      {
        id: "profile",
        label: t("wallet.profile", "Profile"),
        icon: UserIcon,
        onClick: handleProfile,
      },
      {
        id: "favorites",
        label: t("wallet.favorites", "Favorites"),
        icon: StarIcon,
        onClick: handleFavorites,
      },
      {
        id: "dealer",
        label: t("wallet.dealer", "Dealer"),
        icon: BriefcaseIcon,
        onClick: handleDealer,
      },
      {
        id: "portfolio",
        label: t("wallet.portfolio", "Portfolio"),
        icon: TicketIcon,
        onClick: handlePortfolio,
      },
      {
        id: "settings",
        label: t("wallet.settings", "Settings"),
        icon: Cog6ToothIcon,
        onClick: handleSettings,
      },
      {
        id: "separator-2",
        label: "",
        onClick: () => {},
        separator: true,
      },
      {
        id: "disconnect",
        label: t("buttons.disconnect", "Disconnect"),
        icon: ArrowRightOnRectangleIcon,
        onClick: handleDisconnect,
      },
    ],
    [
      t,
      handleCopyAddress,
      handleProfile,
      handleFavorites,
      handleDealer,
      handlePortfolio,
      handleSettings,
      handleDisconnect,
    ],
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
        verified: t("wallet.statusVerified", "Verified"),
        connected: t("wallet.statusConnected", "Connected"),
        disconnected: t("wallet.statusDisconnected", "Disconnected"),
      }}
    />
  );
};

export default ConnectedWalletMenu;

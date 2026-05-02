import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useReadContracts, useChainId } from "wagmi";
import { getContractAddress } from "../../config/contracts";
import { ui } from "@sudobility/design";

const HAS_PERMISSIONS_ABI = [
  {
    name: "hasPermissions",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

interface DealerNFTListProps {
  tokenIds: bigint[];
}

export function DealerNFTList({ tokenIds }: DealerNFTListProps) {
  const { t } = useTranslation("dealer");
  const chainId = useChainId();
  const dealerNFTAddress = getContractAddress(chainId, "dealerNFT");

  const permissionContracts = useMemo(() => {
    if (!dealerNFTAddress || tokenIds.length === 0) return [];
    return tokenIds.map((tokenId) => ({
      address: dealerNFTAddress,
      abi: HAS_PERMISSIONS_ABI,
      functionName: "hasPermissions" as const,
      args: [tokenId] as const,
    }));
  }, [dealerNFTAddress, tokenIds]);

  const { data: permissionResults } = useReadContracts({
    contracts: permissionContracts,
    query: {
      enabled: permissionContracts.length > 0,
    },
  });

  return (
    <div>
      <h2 className={`${ui.text.h3} mb-4`}>
        {t("dashboard.nfts.title", "Your Dealer NFTs")}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {tokenIds.map((tokenId, index) => {
          const hasPermissions =
            permissionResults?.[index]?.status === "success" &&
            permissionResults[index].result === true;

          return (
            <div
              key={tokenId.toString()}
              className="p-4 rounded-lg border border-border bg-card flex flex-col items-center gap-2"
            >
              <p className={`${ui.text.h4} text-center`}>
                {t("dashboard.nfts.tokenId", { id: tokenId.toString() })}
              </p>
              {permissionResults ? (
                <span
                  className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                    hasPermissions
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}
                >
                  {hasPermissions
                    ? t("dashboard.nfts.hasPermissions", "Active")
                    : t("dashboard.nfts.noPermissions", "No Permissions")}
                </span>
              ) : (
                <span className="inline-block h-4 w-16 bg-muted rounded animate-pulse" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

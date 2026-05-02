import { useReadContract, useChainId } from "wagmi";
import { useAuth } from "../context/WalletAuthContext";
import { getContractAddress } from "../config/contracts";
import type { SportCode } from "../config/sportCodes";
import { CATEGORIES } from "../types/market";

const VALIDATE_PERMISSION_ABI = [
  {
    name: "validatePermission",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "category", type: "uint256" },
      { name: "subCategory", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

/**
 * Check if the dealer's token has permission for a given sport.
 * Accepts an optional tokenId; defaults to the first token.
 * Returns { hasPermission, isLoading } so forms can gate submission.
 */
export function useDealerPermission(sportCode: SportCode, tokenId?: bigint) {
  const { dealerTokenIds, isDealer } = useAuth();
  const chainId = useChainId();
  const dealerNFTAddress = getContractAddress(chainId, "dealerNFT");
  const effectiveTokenId = tokenId ?? dealerTokenIds?.[0];

  const { data: permitted, isLoading } = useReadContract({
    address: dealerNFTAddress,
    abi: VALIDATE_PERMISSION_ABI,
    functionName: "validatePermission",
    args:
      effectiveTokenId !== undefined
        ? [
            BigInt(effectiveTokenId),
            BigInt(CATEGORIES.SPORTS),
            BigInt(sportCode),
          ]
        : undefined,
    query: {
      enabled: isDealer && effectiveTokenId !== undefined && !!dealerNFTAddress,
    },
  });

  return {
    hasPermission: permitted === true,
    isLoading,
  };
}

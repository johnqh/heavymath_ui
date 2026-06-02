import { useCallback } from 'react';
import { useConfig } from 'wagmi';
import { getPublicClient, getWalletClient, switchChain } from 'wagmi/actions';
import { getAppConfig } from '../config/app';
import { useMutation } from '@tanstack/react-query';
import { erc20Abi } from 'viem';
import { useToastActions } from './useToastActions';
import { useHeavymathUiText } from '../components/HeavymathUiTextProvider';
import { getContractAddress } from '../config/contracts';

const DEALER_NFT_ABI = [
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'mintPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'stakeToken',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;

export function useMintDealerNFT() {
  const config = useConfig();
  const chainId = getAppConfig().defaultChainId;
  const text = useHeavymathUiText();

  return useMutation({
    mutationFn: async () => {
      // Switch wallet to the correct chain if needed
      const walletClient = await getWalletClient(config);
      if (walletClient.chain?.id !== chainId) {
        await switchChain(config, { chainId });
      }

      // Re-fetch clients after potential chain switch
      const currentWalletClient = await getWalletClient(config);
      const publicClient = getPublicClient(config, { chainId });

      if (!currentWalletClient || !publicClient) {
        throw new Error(text('errors.walletNotConnected'));
      }

      const dealerNFTAddress = getContractAddress(chainId, 'dealerNFT');
      if (
        !dealerNFTAddress ||
        dealerNFTAddress === '0x0000000000000000000000000000000000000000'
      ) {
        throw new Error(text('errors.dealerNftNotDeployed'));
      }

      // Read mint price and stake token address from contract
      const [mintPrice, stakeTokenAddress] = await Promise.all([
        publicClient.readContract({
          address: dealerNFTAddress,
          abi: DEALER_NFT_ABI,
          functionName: 'mintPrice',
        }),
        publicClient.readContract({
          address: dealerNFTAddress,
          abi: DEALER_NFT_ABI,
          functionName: 'stakeToken',
        }),
      ]);

      // Approve USDC if mint price > 0
      if (
        mintPrice > 0n &&
        stakeTokenAddress !== '0x0000000000000000000000000000000000000000'
      ) {
        const account = currentWalletClient.account.address;
        const allowance = await publicClient.readContract({
          address: stakeTokenAddress,
          abi: erc20Abi,
          functionName: 'allowance',
          args: [account, dealerNFTAddress],
        });

        if (allowance < mintPrice) {
          const approveHash = await currentWalletClient.writeContract({
            address: stakeTokenAddress,
            abi: erc20Abi,
            functionName: 'approve',
            args: [dealerNFTAddress, mintPrice],
            chain: publicClient.chain,
          });
          await publicClient.waitForTransactionReceipt({ hash: approveHash });
        }
      }

      // Mint (no ETH value needed — payment is via ERC20)
      const hash = await currentWalletClient.writeContract({
        address: dealerNFTAddress,
        abi: DEALER_NFT_ABI,
        functionName: 'mint',
        args: [],
        chain: publicClient.chain,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      return receipt;
    },
    meta: {
      chainId,
    },
  });
}

export function useMintDealerNFTWithToast() {
  const mutation = useMintDealerNFT();
  const toast = useToastActions();
  const text = useHeavymathUiText();

  const mutateAsync = useCallback(async () => {
    toast.txPending(text('toast.mintingDealerNft'));

    try {
      const result = await mutation.mutateAsync();
      toast.success(
        text('toast.dealerNftMinted'),
        text('toast.dealerNftMintedDesc')
      );
      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : text('toast.mintDealerNftFailed');
      toast.txError(message);
      throw error;
    }
  }, [mutation, toast, text]);

  return {
    ...mutation,
    mutateAsync,
    mutate: () => {
      mutateAsync().catch(() => {});
    },
  };
}

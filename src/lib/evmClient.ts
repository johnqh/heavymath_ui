/**
 * @fileoverview EVM Prediction Client
 * @description Wraps all PredictionMarket smart contract interactions via viem.
 * Handles ERC-20 allowance approval, transaction execution, and contract reads.
 */

import type {
  Abi,
  Address,
  Chain,
  Hash,
  PublicClient,
  WalletClient,
} from "viem";
import { erc20Abi, getAddress } from "viem";

// PredictionMarket ABI - minimal subset needed for our operations
const predictionMarketAbi = [
  {
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "category", type: "uint256" },
      { name: "subCategory", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "description", type: "string" },
      { name: "oracleId", type: "bytes32" },
    ],
    name: "createMarket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "category", type: "uint256" },
      { name: "subCategory", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "description", type: "string" },
      { name: "oracleId", type: "bytes32" },
      { name: "conditionData", type: "bytes32" },
    ],
    name: "createMarketWithCondition",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "percentage", type: "uint256" },
      { name: "amount", type: "uint256" },
    ],
    name: "placePrediction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "newPercentage", type: "uint256" },
      { name: "additionalAmount", type: "uint256" },
    ],
    name: "updatePrediction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "marketId", type: "uint256" }],
    name: "withdrawPrediction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "marketId", type: "uint256" }],
    name: "cancelMarket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "marketId", type: "uint256" }],
    name: "abandonMarket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "positiveOutcome", type: "bool" },
    ],
    name: "resolveMarket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "marketId", type: "uint256" }],
    name: "resolveMarketWithOracle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "marketId", type: "uint256" }],
    name: "requestOracleResolution",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "marketId", type: "uint256" }],
    name: "completeOracleResolution",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "marketId", type: "uint256" }],
    name: "claimWinnings",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "marketId", type: "uint256" }],
    name: "claimRefund",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "marketId", type: "uint256" }],
    name: "lockMarket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "marketId", type: "uint256" }],
    name: "calculateMarketSplit",
    outputs: [
      { name: "negPct", type: "uint256" },
      { name: "posPct", type: "uint256" },
      { name: "negAmt", type: "uint256" },
      { name: "posAmt", type: "uint256" },
      { name: "valid", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "marketId", type: "uint256" }],
    name: "lockRefunds",
    outputs: [
      { name: "negativePercentage", type: "uint256" },
      { name: "positivePercentage", type: "uint256" },
      { name: "negativeAllowedAmount", type: "uint256" },
      { name: "positiveAllowedAmount", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "marketId", type: "uint256" }],
    name: "claimLockRefund",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "predictor", type: "address" },
    ],
    name: "getLockRefundAmount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "marketId", type: "uint256" }],
    name: "withdrawDealerFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawSystemFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "stakeToken",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "testMode",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "marketId", type: "uint256" }],
    name: "markets",
    outputs: [
      { name: "dealer", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "category", type: "uint256" },
      { name: "subCategory", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "description", type: "string" },
      { name: "createdAt", type: "uint256" },
      { name: "dealerFeeBps", type: "uint256" },
      { name: "status", type: "uint8" },
      { name: "positiveOutcome", type: "bool" },
      { name: "oracleId", type: "bytes32" },
      { name: "conditionData", type: "bytes32" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "account", type: "address" },
    ],
    name: "predictions",
    outputs: [
      { name: "amount", type: "uint256" },
      { name: "percentage", type: "uint256" },
      { name: "placedAt", type: "uint256" },
      { name: "claimed", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

/**
 * Context required for wallet-based contract interactions.
 */
export interface WalletContext {
  /** The viem WalletClient for signing transactions */
  walletClient: WalletClient;
  /** Optional PublicClient for reading state and waiting for receipts */
  publicClient?: PublicClient;
  /** Optional chain specification */
  chain?: Chain;
}

/**
 * Contract addresses required by the EVMPredictionClient.
 */
export interface ContractAddresses {
  /** Address of the PredictionMarket contract */
  predictionMarket: Address;
  /** Optional address of the stake token (USDC); resolved from contract if not provided */
  stakeToken?: Address;
}

/**
 * Result of a contract transaction execution.
 */
export interface TransactionResult {
  /** The transaction hash */
  hash: Hash;
  /** The receipt transaction hash (only available if publicClient was provided) */
  receiptHash?: Hash;
}

/**
 * Parameters for creating a new prediction market.
 */
export interface CreateMarketParams {
  /** Dealer NFT token ID authorizing market creation */
  tokenId: bigint;
  /** Market category */
  category: bigint;
  /** Market sub-category */
  subCategory: bigint;
  /** Market deadline as unix timestamp */
  deadline: bigint;
  /** Human-readable market description */
  description: string;
  /** Optional oracle ID for automatic resolution (defaults to zero bytes) */
  oracleId?: Address | `0x${string}`;
  /** Optional encoded resolution condition (defaults to zero bytes = legacy WinLoss) */
  conditionData?: `0x${string}`;
}

/**
 * Client for interacting with the PredictionMarket smart contract.
 * Wraps all contract operations and handles ERC-20 allowance management.
 */
export class EVMPredictionClient {
  private readonly abi: Abi;
  private readonly addresses: ContractAddresses;
  private stakeTokenCache?: Address;

  /**
   * Create a new EVMPredictionClient.
   *
   * @param addresses - The contract addresses to interact with
   */
  constructor(addresses: ContractAddresses) {
    this.addresses = addresses;
    this.abi = predictionMarketAbi as unknown as Abi;
  }

  private predictionMarketAddress(): Address {
    return this.addresses.predictionMarket;
  }

  private ensureAccount(wallet: WalletContext): Address {
    const account = wallet.walletClient.account?.address;
    if (!account) {
      throw new Error("Wallet client is not configured with an account");
    }
    return getAddress(account);
  }

  private getPublicClient(wallet: WalletContext): PublicClient {
    if (wallet.publicClient) {
      return wallet.publicClient;
    }
    throw new Error(
      "A viem PublicClient is required for this operation. Provide wallet.publicClient.",
    );
  }

  private async resolveStakeToken(wallet: WalletContext): Promise<Address> {
    if (this.addresses.stakeToken) {
      return getAddress(this.addresses.stakeToken);
    }
    if (this.stakeTokenCache) {
      return this.stakeTokenCache;
    }
    const publicClient = this.getPublicClient(wallet);
    const address = (await publicClient.readContract({
      address: this.predictionMarketAddress(),
      abi: this.abi,
      functionName: "stakeToken",
    })) as Address;
    this.stakeTokenCache = getAddress(address);
    return this.stakeTokenCache;
  }

  /**
   * Ensure the PredictionMarket contract has sufficient ERC-20 allowance.
   * Automatically approves if current allowance is insufficient.
   */
  private async ensureAllowance(
    wallet: WalletContext,
    amount: bigint,
  ): Promise<void> {
    if (amount === 0n) {
      return;
    }
    const token = await this.resolveStakeToken(wallet);
    const owner = this.ensureAccount(wallet);
    const spender = this.predictionMarketAddress();
    const publicClient = this.getPublicClient(wallet);
    const currentAllowance = (await publicClient.readContract({
      address: token,
      abi: erc20Abi,
      functionName: "allowance",
      args: [owner, spender],
    })) as bigint;
    if (currentAllowance >= amount) {
      return;
    }
    const approveHash = await wallet.walletClient.writeContract({
      address: token,
      abi: erc20Abi,
      functionName: "approve",
      args: [spender, amount],
      chain: wallet.chain,
      account: wallet.walletClient.account!,
    });
    // Wait for the approval to be mined before proceeding,
    // otherwise the subsequent contract call may fail gas estimation
    // because the allowance isn't confirmed on-chain yet.
    await publicClient.waitForTransactionReceipt({ hash: approveHash });
  }

  /**
   * Execute a contract write operation and optionally wait for the receipt.
   * Simulates first via the public client to surface clear revert reasons
   * instead of confusing gas estimation errors.
   */
  private async execute(
    wallet: WalletContext,
    functionName: string,
    args: readonly unknown[],
  ): Promise<TransactionResult> {
    const contractParams = {
      address: this.predictionMarketAddress(),
      abi: this.abi,
      functionName,
      args,
      chain: wallet.chain,
      account: wallet.walletClient.account!,
    } as const;

    // Simulate first to get a clear revert reason if the tx would fail.
    // Without this, a reverting tx produces a confusing "gas limit too high" error
    // because gas estimation returns an inflated value that exceeds the node cap.
    if (wallet.publicClient) {
      await wallet.publicClient.simulateContract(contractParams);
    }

    const hash = await wallet.walletClient.writeContract(contractParams);

    if (wallet.publicClient) {
      const receipt = await wallet.publicClient.waitForTransactionReceipt({
        hash,
      });
      return { hash, receiptHash: receipt.transactionHash };
    }
    return { hash };
  }

  /**
   * Create a new prediction market.
   *
   * @param wallet - Wallet context for signing
   * @param params - Market creation parameters
   * @returns Transaction result with hash
   */
  async createMarket(
    wallet: WalletContext,
    params: CreateMarketParams,
  ): Promise<TransactionResult> {
    const ZERO_BYTES32 =
      "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`;
    const oracle = params.oracleId ?? ZERO_BYTES32;
    const condition = params.conditionData ?? ZERO_BYTES32;

    // Use createMarketWithCondition when conditionData is non-zero
    if (condition !== ZERO_BYTES32) {
      return this.execute(wallet, "createMarketWithCondition", [
        params.tokenId,
        params.category,
        params.subCategory,
        params.deadline,
        params.description,
        oracle,
        condition,
      ]);
    }

    return this.execute(wallet, "createMarket", [
      params.tokenId,
      params.category,
      params.subCategory,
      params.deadline,
      params.description,
      oracle,
    ]);
  }

  /**
   * Place a prediction on a market. Auto-approves USDC allowance if needed.
   *
   * @param wallet - Wallet context for signing
   * @param marketId - The market to predict on
   * @param percentage - Prediction percentage (0-100)
   * @param amount - USDC amount to stake
   * @returns Transaction result
   */
  async placePrediction(
    wallet: WalletContext,
    marketId: bigint,
    percentage: number,
    amount: bigint,
  ): Promise<TransactionResult> {
    await this.ensureAllowance(wallet, amount);
    return this.execute(wallet, "placePrediction", [
      marketId,
      BigInt(percentage),
      amount,
    ]);
  }

  /**
   * Update an existing prediction. Auto-approves USDC allowance for additional amount.
   *
   * @param wallet - Wallet context for signing
   * @param marketId - The market of the prediction
   * @param newPercentage - Updated percentage
   * @param additionalAmount - Additional USDC to add (can be 0)
   * @returns Transaction result
   */
  async updatePrediction(
    wallet: WalletContext,
    marketId: bigint,
    newPercentage: number,
    additionalAmount: bigint,
  ): Promise<TransactionResult> {
    if (additionalAmount > 0n) {
      await this.ensureAllowance(wallet, additionalAmount);
    }
    return this.execute(wallet, "updatePrediction", [
      marketId,
      BigInt(newPercentage),
      additionalAmount,
    ]);
  }

  /**
   * Withdraw a prediction from a market (before deadline).
   *
   * @param wallet - Wallet context for signing
   * @param marketId - The market to withdraw from
   * @returns Transaction result
   */
  async withdrawPrediction(
    wallet: WalletContext,
    marketId: bigint,
  ): Promise<TransactionResult> {
    return this.execute(wallet, "withdrawPrediction", [marketId]);
  }

  /**
   * Cancel a market (dealer only).
   *
   * @param wallet - Wallet context for signing
   * @param marketId - The market to cancel
   * @returns Transaction result
   */
  async cancelMarket(
    wallet: WalletContext,
    marketId: bigint,
  ): Promise<TransactionResult> {
    return this.execute(wallet, "cancelMarket", [marketId]);
  }

  /**
   * Abandon a market (dealer only, after deadline without resolution).
   *
   * @param wallet - Wallet context for signing
   * @param marketId - The market to abandon
   * @returns Transaction result
   */
  async abandonMarket(
    wallet: WalletContext,
    marketId: bigint,
  ): Promise<TransactionResult> {
    return this.execute(wallet, "abandonMarket", [marketId]);
  }

  /**
   * Resolve a market with a manual resolution value (dealer only).
   *
   * @param wallet - Wallet context for signing
   * @param marketId - The market to resolve
   * @param positiveOutcome - true = positive side wins, false = negative side wins
   * @returns Transaction result
   */
  async resolveMarket(
    wallet: WalletContext,
    marketId: bigint,
    positiveOutcome: boolean,
  ): Promise<TransactionResult> {
    return this.execute(wallet, "resolveMarket", [marketId, positiveOutcome]);
  }

  /**
   * Resolve a market using its configured oracle.
   *
   * @param wallet - Wallet context for signing
   * @param marketId - The market to resolve via oracle
   * @returns Transaction result
   */
  async resolveMarketWithOracle(
    wallet: WalletContext,
    marketId: bigint,
  ): Promise<TransactionResult> {
    return this.execute(wallet, "resolveMarketWithOracle", [marketId]);
  }

  /**
   * Request oracle resolution via Chainlink (step 1 of 2).
   * Anyone can call. Sends a Chainlink request to fetch the game result.
   *
   * @param wallet - Wallet context for signing
   * @param marketId - The market to request resolution for
   * @returns Transaction result
   */
  async requestOracleResolution(
    wallet: WalletContext,
    marketId: bigint,
  ): Promise<TransactionResult> {
    return this.execute(wallet, "requestOracleResolution", [marketId]);
  }

  /**
   * Complete oracle resolution after Chainlink callback (step 2 of 2).
   * Anyone can call after the Chainlink callback has delivered the result.
   *
   * @param wallet - Wallet context for signing
   * @param marketId - The market to complete resolution for
   * @returns Transaction result
   */
  async completeOracleResolution(
    wallet: WalletContext,
    marketId: bigint,
  ): Promise<TransactionResult> {
    return this.execute(wallet, "completeOracleResolution", [marketId]);
  }

  /**
   * Claim winnings from a resolved market.
   *
   * @param wallet - Wallet context for signing
   * @param marketId - The market to claim winnings from
   * @returns Transaction result
   */
  async claimWinnings(
    wallet: WalletContext,
    marketId: bigint,
  ): Promise<TransactionResult> {
    return this.execute(wallet, "claimWinnings", [marketId]);
  }

  /**
   * Claim a refund from a cancelled or abandoned market.
   *
   * @param wallet - Wallet context for signing
   * @param marketId - The market to claim a refund from
   * @returns Transaction result
   */
  async claimRefund(
    wallet: WalletContext,
    marketId: bigint,
  ): Promise<TransactionResult> {
    return this.execute(wallet, "claimRefund", [marketId]);
  }

  /**
   * Lock a market after its deadline, calculating the market split and enabling partial refunds.
   * Anyone can call this after the market deadline.
   *
   * @param wallet - Wallet context for signing
   * @param marketId - The market to lock
   * @returns Transaction result
   */
  async lockMarket(
    wallet: WalletContext,
    marketId: bigint,
  ): Promise<TransactionResult> {
    return this.execute(wallet, "lockMarket", [marketId]);
  }

  /**
   * Calculate the market split boundaries (view function).
   *
   * @param publicClient - Public client for reading
   * @param marketId - The market to calculate split for
   * @returns Split boundaries: negPct, posPct, negAmt, posAmt, valid
   */
  async calculateMarketSplit(
    publicClient: PublicClient,
    marketId: bigint,
  ): Promise<[bigint, bigint, bigint, bigint, boolean]> {
    return publicClient.readContract({
      address: this.predictionMarketAddress(),
      abi: predictionMarketAbi,
      functionName: "calculateMarketSplit",
      args: [marketId],
    }) as Promise<[bigint, bigint, bigint, bigint, boolean]>;
  }

  /**
   * Claim partial refund from a locked market (for overweight side bettors).
   *
   * @param wallet - Wallet context for signing
   * @param marketId - The market to claim lock refund from
   * @returns Transaction result
   */
  async claimLockRefund(
    wallet: WalletContext,
    marketId: bigint,
  ): Promise<TransactionResult> {
    return this.execute(wallet, "claimLockRefund", [marketId]);
  }

  /**
   * Read the lock refund amount for a specific predictor.
   *
   * @param publicClient - A viem PublicClient for reading state
   * @param marketId - The market ID
   * @param predictor - The predictor's wallet address
   * @returns The refund amount as bigint
   */
  async getLockRefundAmount(
    publicClient: PublicClient,
    marketId: bigint,
    predictor: Address,
  ): Promise<bigint> {
    const result = await publicClient.readContract({
      address: this.predictionMarketAddress(),
      abi: this.abi,
      functionName: "getLockRefundAmount",
      args: [marketId, predictor],
    });
    return BigInt(result as bigint);
  }

  /**
   * Read the lock refund split boundaries for a locked market.
   *
   * @param publicClient - A viem PublicClient for reading state
   * @param marketId - The market ID
   * @returns { negativePercentage, positivePercentage, negativeAllowedAmount, positiveAllowedAmount }
   */
  async getLockRefundsSplit(
    publicClient: PublicClient,
    marketId: bigint,
  ): Promise<{
    negativePercentage: bigint;
    positivePercentage: bigint;
    negativeAllowedAmount: bigint;
    positiveAllowedAmount: bigint;
  }> {
    const result = (await publicClient.readContract({
      address: this.predictionMarketAddress(),
      abi: this.abi,
      functionName: "lockRefunds",
      args: [marketId],
    })) as [bigint, bigint, bigint, bigint];
    return {
      negativePercentage: result[0],
      positivePercentage: result[1],
      negativeAllowedAmount: result[2],
      positiveAllowedAmount: result[3],
    };
  }

  /**
   * Withdraw accumulated dealer fees from a resolved market (dealer only).
   *
   * @param wallet - Wallet context for signing
   * @param marketId - The market to withdraw fees from
   * @returns Transaction result
   */
  async withdrawDealerFees(
    wallet: WalletContext,
    marketId: bigint,
  ): Promise<TransactionResult> {
    return this.execute(wallet, "withdrawDealerFees", [marketId]);
  }

  /**
   * Withdraw accumulated system fees (admin only).
   *
   * @param wallet - Wallet context for signing
   * @returns Transaction result
   */
  async withdrawSystemFees(wallet: WalletContext): Promise<TransactionResult> {
    return this.execute(wallet, "withdrawSystemFees", []);
  }

  /**
   * Read market data from the smart contract.
   *
   * @param publicClient - A viem PublicClient for reading state
   * @param marketId - The market ID to read
   * @returns Formatted market data
   */
  async getMarket(
    publicClient: PublicClient,
    marketId: bigint,
  ): Promise<ReturnType<typeof formatMarket>> {
    const raw = await publicClient.readContract({
      address: this.predictionMarketAddress(),
      abi: this.abi,
      functionName: "markets",
      args: [marketId],
    });
    return formatMarket(raw as readonly unknown[]);
  }

  /**
   * Read prediction data for a specific user on a market.
   *
   * @param publicClient - A viem PublicClient for reading state
   * @param marketId - The market ID
   * @param account - The user's wallet address
   * @returns Prediction data (amount, percentage, placedAt, claimed)
   */
  /**
   * Read whether the contract is in test mode.
   */
  async getTestMode(publicClient: PublicClient): Promise<boolean> {
    return (await publicClient.readContract({
      address: this.predictionMarketAddress(),
      abi: this.abi,
      functionName: "testMode",
    })) as boolean;
  }

  async getPrediction(
    publicClient: PublicClient,
    marketId: bigint,
    account: Address,
  ) {
    const raw = (await publicClient.readContract({
      address: this.predictionMarketAddress(),
      abi: this.abi,
      functionName: "predictions",
      args: [marketId, account],
    })) as readonly [bigint, bigint, bigint, boolean];
    return {
      amount: BigInt(raw[0]),
      percentage: BigInt(raw[1]),
      placedAt: BigInt(raw[2]),
      claimed: Boolean(raw[3]),
    };
  }
}

/**
 * Format raw contract market data into a structured object.
 *
 * @param raw - Raw tuple from the contract's markets() call
 * @returns Formatted market state object
 */
function formatMarket(raw: readonly unknown[]) {
  return {
    dealer: getAddress(raw[0] as string),
    tokenId: BigInt(raw[1] as bigint),
    category: BigInt(raw[2] as bigint),
    subCategory: BigInt(raw[3] as bigint),
    deadline: BigInt(raw[4] as bigint),
    description: raw[5] as string,
    createdAt: BigInt(raw[6] as bigint),
    dealerFeeBps: BigInt(raw[7] as bigint),
    status: Number(raw[8] as number),
    positiveOutcome: Boolean(raw[9]),
    oracleId: raw[10] as `0x${string}`,
    conditionData: raw[11] as `0x${string}`,
  };
}

/** Type representing formatted on-chain market data */
export type MarketState = ReturnType<typeof formatMarket>;

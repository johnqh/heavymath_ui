/**
 * @fileoverview USDC and display formatting utilities
 * @description Functions for formatting currency, addresses, percentages, dates, and fees
 * for display in the Heavymath prediction market UI.
 */

import { getNow } from "./datetime";

/** USDC has 6 decimals */
const USDC_DECIMALS = 6;

/**
 * Format USDC amount from bigint to human-readable currency string.
 * USDC uses 6 decimal places internally.
 *
 * @param amount - The USDC amount as a bigint (6 decimal places)
 * @param decimals - Number of decimal places to display (default: 2)
 * @returns Formatted currency string (e.g., "$1.00")
 * @example
 * formatUSDC(1_000_000n) // "$1.00"
 * formatUSDC(1_500_000n, 4) // "$1.5000"
 */
export function formatUSDC(amount: bigint, decimals: number = 2): string {
  const divisor = BigInt(10 ** USDC_DECIMALS);
  const wholePart = amount / divisor;
  const fractionalPart = amount % divisor;

  // Convert to number for formatting (safe for display amounts)
  const value =
    Number(wholePart) + Number(fractionalPart) / 10 ** USDC_DECIMALS;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Parse a human-readable USDC string to a bigint amount.
 *
 * @param amount - The USDC amount as a decimal string (e.g., "1.5")
 * @returns The USDC amount as a bigint with 6 decimal places
 * @example
 * parseUSDC("1.5") // 1_500_000n
 * parseUSDC("invalid") // 0n
 */
export function parseUSDC(amount: string): bigint {
  const num = parseFloat(amount);
  if (isNaN(num)) return BigInt(0);
  return BigInt(Math.floor(num * 10 ** USDC_DECIMALS));
}

/**
 * Abbreviate an Ethereum wallet address for display.
 *
 * @param address - The full Ethereum address (0x...)
 * @param chars - Number of characters to show on each side (default: 4)
 * @returns Abbreviated address (e.g., "0x1234...5678")
 * @example
 * formatAddress("0x1234567890abcdef1234567890abcdef12345678") // "0x1234...5678"
 */
export function formatAddress(address: string, chars: number = 4): string {
  if (!address || address.length < chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format a numeric value as a percentage string.
 *
 * @param value - The percentage value (0-100)
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted percentage string (e.g., "50%")
 * @example
 * formatPercentage(75.5, 1) // "75.5%"
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format the time remaining until a deadline as a human-readable string.
 *
 * @param deadline - The deadline date
 * @returns Human-readable time remaining (e.g., "3d 2h remaining") or "Ended"
 * @example
 * formatTimeRemaining(new Date(Date.now() + 86400000)) // "1d 0h remaining"
 * formatTimeRemaining(new Date(Date.now() - 1000)) // "Ended"
 */
export function formatTimeRemaining(deadline: Date): string {
  const now = getNow();
  const diff = deadline.getTime() - now.getTime();

  if (diff <= 0) {
    return "Ended";
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h remaining`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
}

/**
 * Format a date value to a locale-formatted date string.
 * Accepts Date objects, bigint/number unix timestamps (in seconds), or date strings.
 *
 * @param date - The date as a Date object, bigint (unix seconds), number (unix seconds), or string
 * @returns Locale-formatted date string (e.g., "Jan 15, 2024, 02:30 PM")
 * @example
 * formatDate(1705334400n) // "Jan 15, 2024, ..."
 * formatDate(getNow()) // current date formatted
 */
export function formatDate(date: Date | bigint | number | string): string {
  let d: Date;

  if (typeof date === "bigint") {
    d = new Date(Number(date) * 1000);
  } else if (typeof date === "number") {
    d = new Date(date * 1000);
  } else if (typeof date === "string") {
    d = new Date(date);
  } else {
    d = date;
  }

  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format a dealer fee from basis points to a percentage string.
 *
 * @param bps - The fee in basis points (100 bps = 1%)
 * @returns Formatted percentage string (e.g., "2.5%")
 * @example
 * formatDealerFee(250) // "2.5%"
 * formatDealerFee(10) // "0.1%"
 */
export function formatDealerFee(bps: number): string {
  return `${(bps / 100).toFixed(1)}%`;
}

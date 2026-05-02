/**
 * @fileoverview OracleId encoding/decoding for sports markets
 * @description Encodes sport code + game ID into a bytes32 oracleId.
 * Format: [1 byte sport code][31 bytes game ID (uint248)]
 */

import { pad, toHex, hexToBigInt, type Hex } from 'viem';
import { isSportCode, type SportCode } from '../config/sportCodes';

/**
 * Encode a sport code and game ID into a bytes32 oracleId.
 *
 * @param sportCode - Numeric sport code (1-10)
 * @param gameId - Game/fixture ID from the sports API
 * @returns bytes32 hex string
 */
export function encodeOracleId(sportCode: SportCode, gameId: number): Hex {
  if (!isSportCode(sportCode)) {
    throw new Error(`Invalid sport code: ${sportCode}`);
  }
  if (!Number.isInteger(gameId) || gameId < 0) {
    throw new Error(`Invalid game ID: ${gameId}`);
  }

  // Sport code as 1 byte, game ID as uint248 (31 bytes)
  const sportByte = BigInt(sportCode);
  const gameIdBig = BigInt(gameId);

  // Shift sport code to the leftmost byte of 32 bytes (248 bits)
  const combined = (sportByte << 248n) | gameIdBig;
  return pad(toHex(combined), { size: 32 });
}

/**
 * Decode a bytes32 oracleId into sport code and game ID.
 *
 * @param oracleId - bytes32 hex string
 * @returns Decoded sport code and game ID
 */
export function decodeOracleId(oracleId: Hex): { sportCode: SportCode; gameId: number } {
  const value = hexToBigInt(oracleId);

  // Extract sport code from leftmost byte
  const sportCode = Number(value >> 248n);
  // Extract game ID from remaining 31 bytes
  const gameId = Number(value & ((1n << 248n) - 1n));

  if (!isSportCode(sportCode)) {
    throw new Error(`Invalid sport code in oracleId: ${sportCode}`);
  }

  return { sportCode: sportCode as SportCode, gameId };
}

/**
 * Check if an oracleId is a valid sports oracle ID.
 *
 * @param oracleId - bytes32 hex string
 * @returns True if the oracleId has a valid sport code in byte 0
 */
export function isValidSportsOracleId(oracleId: Hex): boolean {
  try {
    const value = hexToBigInt(oracleId);
    const sportCode = Number(value >> 248n);
    return isSportCode(sportCode);
  } catch {
    return false;
  }
}

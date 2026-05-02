import { describe, it, expect } from 'vitest';
import {
  formatUSDC,
  parseUSDC,
  formatAddress,
  formatPercentage,
  formatDealerFee,
} from '../format';

describe('formatUSDC', () => {
  it('formats zero', () => {
    expect(formatUSDC(0n)).toBe('$0.00');
  });

  it('formats whole amounts', () => {
    expect(formatUSDC(1_000_000n)).toBe('$1.00');
    expect(formatUSDC(100_000_000n)).toBe('$100.00');
  });

  it('formats fractional amounts', () => {
    expect(formatUSDC(1_500_000n)).toBe('$1.50');
    expect(formatUSDC(500_000n)).toBe('$0.50');
  });

  it('respects decimal parameter', () => {
    expect(formatUSDC(1_500_000n, 4)).toBe('$1.5000');
  });
});

describe('parseUSDC', () => {
  it('parses whole numbers', () => {
    expect(parseUSDC('1')).toBe(1_000_000n);
  });

  it('parses decimals', () => {
    expect(parseUSDC('1.5')).toBe(1_500_000n);
  });

  it('returns 0 for invalid input', () => {
    expect(parseUSDC('invalid')).toBe(0n);
  });
});

describe('formatAddress', () => {
  it('abbreviates addresses', () => {
    expect(formatAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe(
      '0x1234...5678'
    );
  });

  it('returns short addresses unchanged', () => {
    expect(formatAddress('0x1234')).toBe('0x1234');
  });
});

describe('formatPercentage', () => {
  it('formats whole percentages', () => {
    expect(formatPercentage(50)).toBe('50%');
  });

  it('formats decimal percentages', () => {
    expect(formatPercentage(75.5, 1)).toBe('75.5%');
  });
});

describe('formatDealerFee', () => {
  it('converts basis points to percentage', () => {
    expect(formatDealerFee(250)).toBe('2.5%');
    expect(formatDealerFee(10)).toBe('0.1%');
  });
});

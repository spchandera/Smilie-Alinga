import { describe, expect, it } from 'vitest';
import { convertMoneyToMinorUnits, formatMoney } from '../assets/money-formatting.js';

describe('convertMoneyToMinorUnits', () => {
  it('parses a plain US-formatted amount', () => {
    expect(convertMoneyToMinorUnits('10.00', 'USD')).toBe(1000);
  });

  it('parses a European-formatted amount (thousands dot, decimal comma)', () => {
    expect(convertMoneyToMinorUnits('1.000,50', 'EUR')).toBe(100050);
  });

  it('parses a space-separated thousands amount', () => {
    expect(convertMoneyToMinorUnits('1 000.50', 'EUR')).toBe(100050);
  });

  it('parses an amount with multiple thousands separators', () => {
    expect(convertMoneyToMinorUnits('2,000,000.50', 'USD')).toBe(200000050);
  });

  it('treats a zero-decimal currency as having no decimal portion', () => {
    expect(convertMoneyToMinorUnits('1,234', 'JPY')).toBe(1234);
  });

  it('respects a currency with non-default precision', () => {
    expect(convertMoneyToMinorUnits('9,500', 'KWD')).toBe(9500);
  });

  it('is case-insensitive for the currency code', () => {
    expect(convertMoneyToMinorUnits('10.00', 'usd')).toBe(1000);
  });

  it('returns null for an empty string', () => {
    expect(convertMoneyToMinorUnits('', 'USD')).toBeNull();
  });

  it('returns null for a whitespace-only string', () => {
    expect(convertMoneyToMinorUnits('   ', 'USD')).toBeNull();
  });

  it('returns null when there are no digits at all', () => {
    expect(convertMoneyToMinorUnits('abc', 'USD')).toBeNull();
  });

  it('returns null for null/undefined input', () => {
    expect(convertMoneyToMinorUnits(null, 'USD')).toBeNull();
    expect(convertMoneyToMinorUnits(undefined, 'USD')).toBeNull();
  });

  it('treats a whole number with a thousands-sized trailing group as non-decimal', () => {
    expect(convertMoneyToMinorUnits('2,000,000', 'USD')).toBe(200000000);
  });
});

describe('formatMoney', () => {
  it('formats a plain amount', () => {
    expect(formatMoney(1000, '{{amount}}', 'USD')).toBe('10.00');
  });

  it('groups thousands with a comma by default', () => {
    expect(formatMoney(100000, '{{amount}}', 'USD')).toBe('1,000.00');
  });

  it('applies a currency symbol template', () => {
    expect(formatMoney(1000, '${{amount}}', 'USD')).toBe('$10.00');
  });

  it('formats without decimals', () => {
    expect(formatMoney(100000, '{{amount_no_decimals}}', 'USD')).toBe('1,000');
  });

  it('formats with a comma thousands separator and period decimal', () => {
    expect(formatMoney(100000, '{{amount_with_comma_separator}}', 'USD')).toBe('1.000,00');
  });

  it('formats without decimals using a period thousands separator', () => {
    expect(formatMoney(100000, '{{amount_no_decimals_with_comma_separator}}', 'USD')).toBe('1.000');
  });

  it('formats without decimals using a space thousands separator', () => {
    expect(formatMoney(100000, '{{amount_no_decimals_with_space_separator}}', 'USD')).toBe('1 000');
  });

  it('formats with a space thousands separator and comma decimal', () => {
    expect(formatMoney(100000, '{{amount_with_space_separator}}', 'USD')).toBe('1 000,00');
  });

  it('formats with a space thousands separator and period decimal', () => {
    expect(formatMoney(100000, '{{amount_with_period_and_space_separator}}', 'USD')).toBe('1 000.00');
  });

  it('formats with an apostrophe thousands separator', () => {
    expect(formatMoney(100000, '{{amount_with_apostrophe_separator}}', 'USD')).toBe("1'000.00");
  });

  it('substitutes the currency code placeholder', () => {
    expect(formatMoney(1000, '{{ currency }}', 'USD')).toBe('USD');
  });

  it('respects zero-decimal currencies for the default amount placeholder', () => {
    expect(formatMoney(1234, '{{amount}}', 'JPY')).toBe('1,234');
  });
});

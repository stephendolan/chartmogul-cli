import { describe, expect, it } from 'vitest';
import { convertCentsToDollars } from './utils.js';

describe('convertCentsToDollars', () => {
  it('converts _in_cents fields and strips suffix', () => {
    const input = {
      amount_in_cents: 1500,
      discount_amount_in_cents: 200,
      tax_amount_in_cents: 100,
    };
    const output = convertCentsToDollars(input);
    expect(output).toEqual({
      amount: 15,
      discount_amount: 2,
      tax_amount: 1,
    });
  });

  it('converts MRR/ARR fields', () => {
    const input = {
      mrr: 10000,
      arr: 120000,
      activity_mrr: 5000,
      activity_arr: 60000,
      activity_mrr_movement: 1000,
    };
    const output = convertCentsToDollars(input);
    expect(output).toEqual({
      mrr: 100,
      arr: 1200,
      activity_mrr: 50,
      activity_arr: 600,
      activity_mrr_movement: 10,
    });
  });

  it('converts hyphenated activity fields', () => {
    const input = {
      'activity-mrr': 5000,
      'activity-arr': 60000,
      'activity-mrr-movement': 1000,
    };
    const output = convertCentsToDollars(input);
    expect(output).toEqual({
      'activity-mrr': 50,
      'activity-arr': 600,
      'activity-mrr-movement': 10,
    });
  });

  it('converts metric fields', () => {
    const input = {
      arpa: 5000,
      asp: 10000,
      ltv: 100000,
      'new-biz': 2000,
      expansion: 1000,
      contraction: 500,
      churn: 300,
      reactivation: 200,
    };
    const output = convertCentsToDollars(input);
    expect(output).toEqual({
      arpa: 50,
      asp: 100,
      ltv: 1000,
      'new-biz': 20,
      expansion: 10,
      contraction: 5,
      churn: 3,
      reactivation: 2,
    });
  });

  it('preserves non-cents fields', () => {
    const input = {
      name: 'Customer',
      customers: 100,
      date: '2024-01-01',
      currency: 'USD',
    };
    const output = convertCentsToDollars(input);
    expect(output).toEqual(input);
  });

  it('handles nested objects', () => {
    const input = {
      entries: [
        { date: '2024-01-01', mrr: 10000 },
        { date: '2024-02-01', mrr: 12000 },
      ],
    };
    const output = convertCentsToDollars(input);
    expect(output).toEqual({
      entries: [
        { date: '2024-01-01', mrr: 100 },
        { date: '2024-02-01', mrr: 120 },
      ],
    });
  });

  it('handles null and undefined', () => {
    expect(convertCentsToDollars(null)).toBe(null);
    expect(convertCentsToDollars(undefined)).toBe(undefined);
  });

  it('handles arrays', () => {
    const input = [{ mrr: 1000 }, { mrr: 2000 }];
    const output = convertCentsToDollars(input);
    expect(output).toEqual([{ mrr: 10 }, { mrr: 20 }]);
  });

  it('strips _in_cents suffix from custom fields', () => {
    const input = { custom_amount_in_cents: 5000 };
    const output = convertCentsToDollars(input);
    expect(output).toEqual({ custom_amount: 50 });
  });
});

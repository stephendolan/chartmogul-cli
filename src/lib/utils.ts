function centsToDollars(cents: number): number {
  return cents / 100;
}

const CENTS_FIELDS = new Set([
  'amount_in_cents',
  'discount_amount_in_cents',
  'tax_amount_in_cents',
  'mrr',
  'arr',
  'arpa',
  'asp',
  'ltv',
  'activity_mrr',
  'activity_arr',
  'activity_mrr_movement',
  'new-biz',
  'expansion',
  'contraction',
  'churn',
  'reactivation',
]);

function isCentsField(fieldName: string): boolean {
  return CENTS_FIELDS.has(fieldName) || fieldName.endsWith('_in_cents');
}

export function convertCentsToDollars(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  if (Array.isArray(data)) return data.map(convertCentsToDollars);
  if (typeof data !== 'object') return data;

  const converted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (isCentsField(key) && typeof value === 'number') {
      converted[key] = centsToDollars(value);
    } else {
      converted[key] = convertCentsToDollars(value);
    }
  }
  return converted;
}

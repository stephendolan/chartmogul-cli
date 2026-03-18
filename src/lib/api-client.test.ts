import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ChartMogulClient, isValidCustomerUuid } from './api-client.js';
import { ChartMogulCliError } from './errors.js';

vi.mock('./auth.js', () => ({
  auth: { getApiKey: () => 'test-api-key' },
}));

const mockCustomer = {
  id: 1,
  uuid: 'cus_test-uuid',
  external_id: 'cus_ext_123',
  name: 'Acme Corp',
  email: 'billing@acme.com',
  status: 'Active',
  mrr: 49900,
  arr: 598800,
  currency: 'USD',
  currency_sign: '$',
  chartmogul_url: 'https://app.chartmogul.com/#/customers/cus_test-uuid',
  data_source_uuid: 'ds_test',
};

const mockSubscription = {
  id: 1,
  uuid: 'sub_test-uuid',
  external_id: 'sub_ext_123',
  plan_uuid: 'plan_test',
  customer_uuid: 'cus_test-uuid',
  data_source_uuid: 'ds_test',
  cancellation_dates: [],
  mrr: 49900,
  arr: 598800,
};

describe('isValidCustomerUuid', () => {
  it('accepts cus_ prefixed IDs', () => {
    expect(isValidCustomerUuid('cus_a1b2c3d4')).toBe(true);
    expect(isValidCustomerUuid('cus_test-uuid')).toBe(true);
    expect(isValidCustomerUuid('cus_abc123-def456')).toBe(true);
  });

  it('accepts standard UUIDs', () => {
    expect(isValidCustomerUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isValidCustomerUuid('A550E840-E29B-41D4-A716-446655440000')).toBe(true);
  });

  it('rejects slug-format IDs from ChartMogul URLs', () => {
    expect(isValidCustomerUuid('293549973-Alens_Team')).toBe(false);
    expect(isValidCustomerUuid('123456789-Some_Company')).toBe(false);
  });

  it('rejects plain numbers', () => {
    expect(isValidCustomerUuid('293549973')).toBe(false);
  });

  it('rejects arbitrary strings', () => {
    expect(isValidCustomerUuid('not-a-uuid')).toBe(false);
    expect(isValidCustomerUuid('')).toBe(false);
  });
});

describe('getCustomer validation', () => {
  let client: ChartMogulClient;

  beforeEach(() => {
    client = new ChartMogulClient();
    vi.restoreAllMocks();
  });

  it('rejects slug-format IDs with a helpful error', async () => {
    await expect(client.getCustomer('293549973-Alens_Team')).rejects.toThrow(ChartMogulCliError);
    await expect(client.getCustomer('293549973-Alens_Team')).rejects.toThrow(
      /Invalid customer ID format.*list_customers with external_id/
    );
  });

  it('accepts cus_ prefixed IDs', async () => {
    vi.spyOn(client as any, 'request').mockResolvedValue(mockCustomer);
    const result = await client.getCustomer('cus_test-uuid');
    expect(result).toEqual(mockCustomer);
  });
});

describe('customerLookup', () => {
  let client: ChartMogulClient;

  beforeEach(() => {
    client = new ChartMogulClient();
    vi.restoreAllMocks();
  });

  it('looks up by uuid', async () => {
    vi.spyOn(client, 'getCustomer').mockResolvedValue(mockCustomer);
    vi.spyOn(client, 'getCustomerSubscriptions').mockResolvedValue({
      entries: [mockSubscription],
    });

    const result = await client.customerLookup({ by: 'uuid', value: 'cus_test-uuid' });

    expect(client.getCustomer).toHaveBeenCalledWith('cus_test-uuid');
    expect(result.customer).toEqual(mockCustomer);
    expect(result.subscriptions).toEqual([mockSubscription]);
  });

  it('looks up by email', async () => {
    vi.spyOn(client, 'searchCustomers').mockResolvedValue({ entries: [mockCustomer] });
    vi.spyOn(client, 'getCustomerSubscriptions').mockResolvedValue({ entries: [] });

    const result = await client.customerLookup({ by: 'email', value: 'billing@acme.com' });

    expect(client.searchCustomers).toHaveBeenCalledWith('billing@acme.com');
    expect(result.customer).toEqual(mockCustomer);
  });

  it('looks up by external_id', async () => {
    vi.spyOn(client, 'listCustomers').mockResolvedValue({
      entries: [mockCustomer],
      has_more: false,
      per_page: 200,
      page: 1,
      current_page: 1,
      total_pages: 1,
    });
    vi.spyOn(client, 'getCustomerSubscriptions').mockResolvedValue({ entries: [] });

    const result = await client.customerLookup({ by: 'external_id', value: 'cus_ext_123' });

    expect(client.listCustomers).toHaveBeenCalledWith({ external_id: 'cus_ext_123' });
    expect(result.customer).toEqual(mockCustomer);
  });

  it('looks up by name (case-insensitive)', async () => {
    vi.spyOn(client, 'listCustomers').mockResolvedValue({
      entries: [mockCustomer],
      has_more: false,
      per_page: 200,
      page: 1,
      current_page: 1,
      total_pages: 1,
    });
    vi.spyOn(client, 'getCustomerSubscriptions').mockResolvedValue({ entries: [] });

    const result = await client.customerLookup({ by: 'name', value: 'acme corp' });

    expect(result.customer).toEqual(mockCustomer);
  });

  it('throws when email not found', async () => {
    vi.spyOn(client, 'searchCustomers').mockResolvedValue({ entries: [] });

    await expect(client.customerLookup({ by: 'email', value: 'nobody@example.com' })).rejects.toThrow(
      ChartMogulCliError
    );
  });

  it('throws when external_id not found', async () => {
    vi.spyOn(client, 'listCustomers').mockResolvedValue({
      entries: [],
      has_more: false,
      per_page: 200,
      page: 1,
      current_page: 1,
      total_pages: 1,
    });

    await expect(
      client.customerLookup({ by: 'external_id', value: 'nonexistent' })
    ).rejects.toThrow(ChartMogulCliError);
  });

  it('throws when name not found', async () => {
    vi.spyOn(client, 'listCustomers').mockResolvedValue({
      entries: [mockCustomer],
      has_more: false,
      per_page: 200,
      page: 1,
      current_page: 1,
      total_pages: 1,
    });

    await expect(
      client.customerLookup({ by: 'name', value: 'Nonexistent Corp' })
    ).rejects.toThrow(ChartMogulCliError);
  });
});

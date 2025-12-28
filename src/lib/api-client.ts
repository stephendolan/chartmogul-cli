import { auth } from './auth.js';
import { ChartMogulCliError, ChartMogulApiError } from './errors.js';
import type {
  Account,
  DataSource,
  Customer,
  Plan,
  Subscription,
  Invoice,
  MetricsResponse,
  Activity,
  CustomerListResponse,
  PaginatedResponse,
} from '../types/index.js';

const API_BASE = 'https://api.chartmogul.com/v1';

export class ChartMogulClient {
  private getAuthHeader(): string {
    const apiKey = auth.getApiKey();
    if (!apiKey) {
      throw new ChartMogulCliError('Not authenticated. Please run: chartmogul auth login', 401);
    }
    return `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`;
  }

  private async request<T>(
    method: string,
    path: string,
    options: {
      params?: Record<string, string | number | boolean | undefined>;
      body?: unknown;
    } = {}
  ): Promise<T> {
    const { params, body } = options;

    const url = new URL(`${API_BASE}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    const authHeader = this.getAuthHeader();
    const fetchOptions: RequestInit = {
      method,
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    };
    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    let response: Response;
    try {
      response = await fetch(url.toString(), fetchOptions);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown network error';
      throw new ChartMogulCliError(`Network request failed: ${message}`, 0);
    }

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || '60';
      throw new ChartMogulCliError(
        `Rate limited by ChartMogul API. Retry after ${retryAfter} seconds.`,
        429
      );
    }

    if (response.status === 204) {
      return {} as T;
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ChartMogulApiError('API request failed', error, response.status);
    }

    return response.json() as Promise<T>;
  }

  async getAccount() {
    return this.request<Account>('GET', '/account');
  }

  async ping() {
    return this.request<{ data: string }>('GET', '/ping');
  }

  async listDataSources() {
    return this.request<{ data_sources: DataSource[] }>('GET', '/data_sources');
  }

  async getDataSource(uuid: string) {
    return this.request<DataSource>('GET', `/data_sources/${uuid}`);
  }

  async listCustomers(
    params: {
      data_source_uuid?: string;
      status?: string;
      system?: string;
      external_id?: string;
      page?: number;
      per_page?: number;
    } = {}
  ) {
    return this.request<CustomerListResponse>('GET', '/customers', { params });
  }

  async getCustomer(uuid: string) {
    return this.request<Customer>('GET', `/customers/${uuid}`);
  }

  async searchCustomers(email: string) {
    return this.request<{ entries: Customer[] }>('GET', '/customers/search', {
      params: { email },
    });
  }

  async getCustomerActivities(uuid: string, params: { page?: number; per_page?: number } = {}) {
    return this.request<PaginatedResponse<Activity>>('GET', `/customers/${uuid}/activities`, {
      params,
    });
  }

  async getCustomerSubscriptions(uuid: string) {
    return this.request<{ entries: Subscription[] }>('GET', `/customers/${uuid}/subscriptions`);
  }

  async listPlans(params: { data_source_uuid?: string; page?: number; per_page?: number } = {}) {
    return this.request<{ plans: Plan[]; has_more: boolean; per_page: number; page: number }>(
      'GET',
      '/plans',
      { params }
    );
  }

  async getPlan(uuid: string) {
    return this.request<Plan>('GET', `/plans/${uuid}`);
  }

  async listInvoices(
    params: {
      customer_uuid?: string;
      data_source_uuid?: string;
      external_id?: string;
      page?: number;
      per_page?: number;
    } = {}
  ) {
    return this.request<{ invoices: Invoice[]; has_more: boolean }>('GET', '/invoices', { params });
  }

  async getInvoice(uuid: string) {
    return this.request<Invoice>('GET', `/invoices/${uuid}`);
  }

  async getMrr(params: { 'start-date': string; 'end-date': string; interval?: string }) {
    return this.request<MetricsResponse>('GET', '/metrics/mrr', { params });
  }

  async getArr(params: { 'start-date': string; 'end-date': string; interval?: string }) {
    return this.request<MetricsResponse>('GET', '/metrics/arr', { params });
  }

  async getArpa(params: { 'start-date': string; 'end-date': string; interval?: string }) {
    return this.request<MetricsResponse>('GET', '/metrics/arpa', { params });
  }

  async getAsp(params: { 'start-date': string; 'end-date': string; interval?: string }) {
    return this.request<MetricsResponse>('GET', '/metrics/asp', { params });
  }

  async getCustomerCount(params: { 'start-date': string; 'end-date': string; interval?: string }) {
    return this.request<MetricsResponse>('GET', '/metrics/customer-count', { params });
  }

  async getCustomerChurnRate(params: {
    'start-date': string;
    'end-date': string;
    interval?: string;
  }) {
    return this.request<MetricsResponse>('GET', '/metrics/customer-churn-rate', { params });
  }

  async getMrrChurnRate(params: { 'start-date': string; 'end-date': string; interval?: string }) {
    return this.request<MetricsResponse>('GET', '/metrics/mrr-churn-rate', { params });
  }

  async getLtv(params: { 'start-date': string; 'end-date': string; interval?: string }) {
    return this.request<MetricsResponse>('GET', '/metrics/ltv', { params });
  }

  async getAllMetrics(params: { 'start-date': string; 'end-date': string; interval?: string }) {
    return this.request<MetricsResponse>('GET', '/metrics/all', { params });
  }

  async listActivities(
    params: {
      'start-date'?: string;
      'end-date'?: string;
      type?: string;
      page?: number;
      per_page?: number;
    } = {}
  ) {
    return this.request<PaginatedResponse<Activity>>('GET', '/activities', { params });
  }
}

export const client = new ChartMogulClient();

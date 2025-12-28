export interface OutputOptions {
  compact?: boolean;
}

export interface ChartMogulError {
  name: string;
  detail: string;
  statusCode?: number;
}

export interface Account {
  name: string;
  currency: string;
  time_zone: string;
  week_start_on: string;
}

export interface DataSource {
  uuid: string;
  name: string;
  system: string;
  created_at: string;
  status: string;
}

export interface Customer {
  id: number;
  uuid: string;
  external_id: string;
  data_source_uuid: string;
  name: string;
  email?: string;
  company?: string;
  country?: string;
  state?: string;
  city?: string;
  zip?: string;
  lead_created_at?: string;
  free_trial_started_at?: string;
  status: string;
  customer_since?: string;
  mrr: number;
  arr: number;
  billing_system_url?: string;
  chartmogul_url: string;
  billing_system_type?: string;
  currency: string;
  currency_sign: string;
  address?: CustomerAddress;
  attributes?: CustomerAttributes;
}

export interface CustomerAddress {
  address_zip?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface CustomerAttributes {
  tags?: string[];
  stripe?: Record<string, unknown>;
  clearbit?: Record<string, unknown>;
  custom?: Record<string, unknown>;
}

export interface Plan {
  uuid: string;
  data_source_uuid: string;
  external_id: string;
  name: string;
  interval_count: number;
  interval_unit: string;
}

export interface Subscription {
  id: number;
  uuid: string;
  external_id: string;
  plan_uuid: string;
  customer_uuid: string;
  data_source_uuid: string;
  cancellation_dates: string[];
}

export interface Invoice {
  uuid: string;
  external_id: string;
  date: string;
  due_date?: string;
  currency: string;
  customer_uuid: string;
  data_source_uuid: string;
  line_items: LineItem[];
  transactions: Transaction[];
}

export interface LineItem {
  uuid: string;
  external_id?: string;
  type: string;
  subscription_external_id?: string;
  subscription_uuid?: string;
  plan_uuid?: string;
  prorated?: boolean;
  service_period_start: string;
  service_period_end: string;
  amount_in_cents: number;
  quantity?: number;
  discount_code?: string;
  discount_amount_in_cents?: number;
  tax_amount_in_cents?: number;
  account_code?: string;
}

export interface Transaction {
  uuid: string;
  external_id?: string;
  type: string;
  date: string;
  result: string;
}

export interface MetricEntry {
  date: string;
  mrr?: number;
  arr?: number;
  arpa?: number;
  asp?: number;
  'customer-churn-rate'?: number;
  'mrr-churn-rate'?: number;
  ltv?: number;
  customers?: number;
  'new-biz'?: number;
  expansion?: number;
  contraction?: number;
  churn?: number;
  reactivation?: number;
}

export interface MetricsResponse {
  entries: MetricEntry[];
  summary?: Record<string, number>;
}

export interface Activity {
  uuid: string;
  date: string;
  type: string;
  description: string;
  activity_mrr: number;
  activity_mrr_movement: number;
  activity_arr: number;
  currency: string;
  currency_sign: string;
}

export interface PaginatedResponse<T> {
  entries: T[];
  has_more: boolean;
  per_page: number;
  page: number;
  current_page?: number;
  total_pages?: number;
}

export interface CustomerListResponse {
  entries: Customer[];
  has_more: boolean;
  per_page: number;
  page: number;
  current_page: number;
  total_pages: number;
}

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { client } from '../lib/api-client.js';
import { auth } from '../lib/auth.js';
import { convertCentsToDollars } from '../lib/utils.js';

const toolRegistry = [
  { name: 'get_all_metrics', description: 'Get all revenue metrics (MRR, ARR, ARPA, churn rates, LTV, customer count) for a date range' },
  { name: 'get_mrr', description: 'Get Monthly Recurring Revenue (MRR) for a date range' },
  { name: 'get_arr', description: 'Get Annual Recurring Revenue (ARR) for a date range' },
  { name: 'get_customer_churn_rate', description: 'Get customer churn rate for a date range' },
  { name: 'get_mrr_churn_rate', description: 'Get MRR churn rate for a date range' },
  { name: 'list_activities', description: 'List subscription activities (new business, expansion, contraction, churn)' },
  { name: 'search_customers', description: 'Search for customers by email address' },
  { name: 'get_customer', description: 'Get detailed information about a specific customer' },
  { name: 'get_customers_batch', description: 'Get detailed information about multiple customers in one call' },
  { name: 'get_customer_activities', description: 'Get subscription activities for a specific customer' },
  { name: 'get_customer_subscriptions', description: 'Get active subscriptions for a specific customer' },
  { name: 'list_customers', description: 'List all customers with optional filtering' },
  { name: 'get_account', description: 'Get ChartMogul account information' },
  { name: 'check_auth', description: 'Check if ChartMogul authentication is configured' },
];

const server = new McpServer({
  name: 'chartmogul',
  version: '1.0.0',
});

function jsonResponse(data: unknown) {
  const converted = convertCentsToDollars(data);
  return { content: [{ type: 'text' as const, text: JSON.stringify(converted, null, 2) }] };
}

const dateRangeSchema = {
  startDate: z.string().describe('Start date (YYYY-MM-DD)'),
  endDate: z.string().describe('End date (YYYY-MM-DD)'),
  interval: z
    .enum(['day', 'week', 'month', 'quarter'])
    .optional()
    .describe('Aggregation interval'),
};

server.tool(
  'get_all_metrics',
  'Get all revenue metrics (MRR, ARR, ARPA, churn rates, LTV, customer count) for a date range',
  {
    startDate: dateRangeSchema.startDate,
    endDate: dateRangeSchema.endDate,
    interval: dateRangeSchema.interval,
  },
  async ({ startDate, endDate, interval }) =>
    jsonResponse(await client.getAllMetrics({ 'start-date': startDate, 'end-date': endDate, interval }))
);

server.tool(
  'get_mrr',
  'Get Monthly Recurring Revenue (MRR) for a date range',
  {
    startDate: dateRangeSchema.startDate,
    endDate: dateRangeSchema.endDate,
    interval: dateRangeSchema.interval,
  },
  async ({ startDate, endDate, interval }) =>
    jsonResponse(await client.getMrr({ 'start-date': startDate, 'end-date': endDate, interval }))
);

server.tool(
  'get_arr',
  'Get Annual Recurring Revenue (ARR) for a date range',
  {
    startDate: dateRangeSchema.startDate,
    endDate: dateRangeSchema.endDate,
    interval: dateRangeSchema.interval,
  },
  async ({ startDate, endDate, interval }) =>
    jsonResponse(await client.getArr({ 'start-date': startDate, 'end-date': endDate, interval }))
);

server.tool(
  'get_customer_churn_rate',
  'Get customer churn rate for a date range',
  {
    startDate: dateRangeSchema.startDate,
    endDate: dateRangeSchema.endDate,
    interval: dateRangeSchema.interval,
  },
  async ({ startDate, endDate, interval }) =>
    jsonResponse(await client.getCustomerChurnRate({ 'start-date': startDate, 'end-date': endDate, interval }))
);

server.tool(
  'get_mrr_churn_rate',
  'Get MRR churn rate for a date range',
  {
    startDate: dateRangeSchema.startDate,
    endDate: dateRangeSchema.endDate,
    interval: dateRangeSchema.interval,
  },
  async ({ startDate, endDate, interval }) =>
    jsonResponse(await client.getMrrChurnRate({ 'start-date': startDate, 'end-date': endDate, interval }))
);

server.tool(
  'list_activities',
  'List subscription activities (new business, expansion, contraction, churn)',
  {
    startDate: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    endDate: z.string().optional().describe('End date (YYYY-MM-DD)'),
    type: z
      .enum(['new-biz', 'expansion', 'contraction', 'churn', 'reactivation'])
      .optional()
      .describe('Activity type filter'),
    page: z.number().optional().describe('Page number'),
    perPage: z.number().optional().describe('Results per page'),
    enrich: z.boolean().optional().describe('Include customer tenure data (customer-since, customer-tenure-months)'),
  },
  async ({ startDate, endDate, type, page, perPage, enrich }) => {
    const params = { 'start-date': startDate, 'end-date': endDate, type, page, per_page: perPage };
    const result = enrich
      ? await client.listActivitiesEnriched(params)
      : await client.listActivities(params);
    return jsonResponse(result);
  }
);

server.tool(
  'search_customers',
  'Search for customers by email address',
  { email: z.string().describe('Email address to search for') },
  async ({ email }) => jsonResponse(await client.searchCustomers(email))
);

server.tool(
  'get_customer',
  'Get detailed information about a specific customer',
  { uuid: z.string().describe('Customer UUID') },
  async ({ uuid }) => jsonResponse(await client.getCustomer(uuid))
);

server.tool(
  'get_customers_batch',
  'Get detailed information about multiple customers in one call',
  { uuids: z.array(z.string()).describe('Array of customer UUIDs') },
  async ({ uuids }) => jsonResponse(await client.getCustomersBatch(uuids))
);

server.tool(
  'get_customer_activities',
  'Get subscription activities for a specific customer',
  {
    uuid: z.string().describe('Customer UUID'),
    page: z.number().optional().describe('Page number'),
    perPage: z.number().optional().describe('Results per page'),
  },
  async ({ uuid, page, perPage }) =>
    jsonResponse(await client.getCustomerActivities(uuid, { page, per_page: perPage }))
);

server.tool(
  'get_customer_subscriptions',
  'Get active subscriptions for a specific customer',
  { uuid: z.string().describe('Customer UUID') },
  async ({ uuid }) => jsonResponse(await client.getCustomerSubscriptions(uuid))
);

server.tool(
  'list_customers',
  'List all customers with optional filtering',
  {
    status: z.enum(['Lead', 'Active', 'Past Due', 'Cancelled']).optional().describe('Customer status'),
    page: z.number().optional().describe('Page number'),
    perPage: z.number().optional().describe('Results per page'),
  },
  async ({ status, page, perPage }) =>
    jsonResponse(await client.listCustomers({ status, page, per_page: perPage }))
);

server.tool(
  'get_account',
  'Get ChartMogul account information',
  {},
  async () => jsonResponse(await client.getAccount())
);

server.tool(
  'check_auth',
  'Check if ChartMogul authentication is configured',
  {},
  async () => jsonResponse({ authenticated: auth.isAuthenticated() })
);

server.tool(
  'search_tools',
  'Search for available tools by name or description using regex. Returns matching tool names.',
  {
    query: z.string().describe('Regex pattern to match against tool names and descriptions (case-insensitive)'),
  },
  async ({ query }) => {
    try {
      const pattern = new RegExp(query, 'i');
      const matches = toolRegistry.filter((t) => pattern.test(t.name) || pattern.test(t.description));
      return jsonResponse({ tools: matches });
    } catch {
      return jsonResponse({ error: 'Invalid regex pattern' });
    }
  }
);

export async function runMcpServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

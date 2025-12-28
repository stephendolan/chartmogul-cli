import { Command } from 'commander';
import { client } from '../lib/api-client.js';
import { outputJson } from '../lib/output.js';
import { withErrorHandling } from '../lib/command-utils.js';
import { getDefaultDateRange, parseDate } from '../lib/dates.js';

interface MetricOptions {
  startDate?: string;
  endDate?: string;
  interval?: string;
}

function buildMetricParams(options: MetricOptions) {
  const defaults = getDefaultDateRange();
  return {
    'start-date': options.startDate ? parseDate(options.startDate) : defaults.startDate,
    'end-date': options.endDate ? parseDate(options.endDate) : defaults.endDate,
    interval: options.interval,
  };
}

export function createMetricsCommand(): Command {
  const cmd = new Command('metrics').description('Metrics and analytics');

  cmd
    .command('all')
    .description('Get all key metrics')
    .option('--start-date <date>', 'Start date (YYYY-MM-DD)')
    .option('--end-date <date>', 'End date (YYYY-MM-DD)')
    .option('--interval <interval>', 'Interval (day, week, month, quarter)')
    .action(
      withErrorHandling(async (options: MetricOptions) => {
        const result = await client.getAllMetrics(buildMetricParams(options));
        outputJson(result);
      })
    );

  cmd
    .command('mrr')
    .description('Get Monthly Recurring Revenue')
    .option('--start-date <date>', 'Start date (YYYY-MM-DD)')
    .option('--end-date <date>', 'End date (YYYY-MM-DD)')
    .option('--interval <interval>', 'Interval (day, week, month, quarter)')
    .action(
      withErrorHandling(async (options: MetricOptions) => {
        const result = await client.getMrr(buildMetricParams(options));
        outputJson(result);
      })
    );

  cmd
    .command('arr')
    .description('Get Annual Recurring Revenue')
    .option('--start-date <date>', 'Start date (YYYY-MM-DD)')
    .option('--end-date <date>', 'End date (YYYY-MM-DD)')
    .option('--interval <interval>', 'Interval (day, week, month, quarter)')
    .action(
      withErrorHandling(async (options: MetricOptions) => {
        const result = await client.getArr(buildMetricParams(options));
        outputJson(result);
      })
    );

  cmd
    .command('arpa')
    .description('Get Average Revenue Per Account')
    .option('--start-date <date>', 'Start date (YYYY-MM-DD)')
    .option('--end-date <date>', 'End date (YYYY-MM-DD)')
    .option('--interval <interval>', 'Interval (day, week, month, quarter)')
    .action(
      withErrorHandling(async (options: MetricOptions) => {
        const result = await client.getArpa(buildMetricParams(options));
        outputJson(result);
      })
    );

  cmd
    .command('asp')
    .description('Get Average Sale Price')
    .option('--start-date <date>', 'Start date (YYYY-MM-DD)')
    .option('--end-date <date>', 'End date (YYYY-MM-DD)')
    .option('--interval <interval>', 'Interval (day, week, month, quarter)')
    .action(
      withErrorHandling(async (options: MetricOptions) => {
        const result = await client.getAsp(buildMetricParams(options));
        outputJson(result);
      })
    );

  cmd
    .command('customer-count')
    .description('Get customer count over time')
    .option('--start-date <date>', 'Start date (YYYY-MM-DD)')
    .option('--end-date <date>', 'End date (YYYY-MM-DD)')
    .option('--interval <interval>', 'Interval (day, week, month, quarter)')
    .action(
      withErrorHandling(async (options: MetricOptions) => {
        const result = await client.getCustomerCount(buildMetricParams(options));
        outputJson(result);
      })
    );

  cmd
    .command('customer-churn')
    .description('Get customer churn rate')
    .option('--start-date <date>', 'Start date (YYYY-MM-DD)')
    .option('--end-date <date>', 'End date (YYYY-MM-DD)')
    .option('--interval <interval>', 'Interval (day, week, month, quarter)')
    .action(
      withErrorHandling(async (options: MetricOptions) => {
        const result = await client.getCustomerChurnRate(buildMetricParams(options));
        outputJson(result);
      })
    );

  cmd
    .command('mrr-churn')
    .description('Get MRR churn rate')
    .option('--start-date <date>', 'Start date (YYYY-MM-DD)')
    .option('--end-date <date>', 'End date (YYYY-MM-DD)')
    .option('--interval <interval>', 'Interval (day, week, month, quarter)')
    .action(
      withErrorHandling(async (options: MetricOptions) => {
        const result = await client.getMrrChurnRate(buildMetricParams(options));
        outputJson(result);
      })
    );

  cmd
    .command('ltv')
    .description('Get Customer Lifetime Value')
    .option('--start-date <date>', 'Start date (YYYY-MM-DD)')
    .option('--end-date <date>', 'End date (YYYY-MM-DD)')
    .option('--interval <interval>', 'Interval (day, week, month, quarter)')
    .action(
      withErrorHandling(async (options: MetricOptions) => {
        const result = await client.getLtv(buildMetricParams(options));
        outputJson(result);
      })
    );

  return cmd;
}

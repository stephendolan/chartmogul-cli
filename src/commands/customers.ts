import { Command } from 'commander';
import { client } from '../lib/api-client.js';
import { config } from '../lib/config.js';
import { outputJson } from '../lib/output.js';
import { withErrorHandling } from '../lib/command-utils.js';

export function createCustomersCommand(): Command {
  const cmd = new Command('customers').description('Customer queries');

  cmd
    .command('list')
    .description('List customers')
    .option('--data-source <uuid>', 'Filter by data source UUID')
    .option('--status <status>', 'Filter by status (Lead, Active, Cancelled)')
    .option('--external-id <id>', 'Filter by external ID')
    .option('--page <number>', 'Page number')
    .option('--per-page <number>', 'Results per page (max 200)')
    .action(
      withErrorHandling(
        async (options: {
          dataSource?: string;
          status?: string;
          externalId?: string;
          page?: string;
          perPage?: string;
        }) => {
          const result = await client.listCustomers({
            data_source_uuid: options.dataSource || config.getDefaultDataSource(),
            status: options.status,
            external_id: options.externalId,
            page: options.page ? parseInt(options.page, 10) : undefined,
            per_page: options.perPage ? parseInt(options.perPage, 10) : undefined,
          });
          outputJson(result);
        }
      )
    );

  cmd
    .command('view')
    .description('View a customer')
    .argument('<uuid>', 'Customer UUID')
    .action(
      withErrorHandling(async (uuid: string) => {
        const customer = await client.getCustomer(uuid);
        outputJson(customer);
      })
    );

  cmd
    .command('search')
    .description('Search customers by email')
    .requiredOption('--email <email>', 'Email address to search')
    .action(
      withErrorHandling(async (options: { email: string }) => {
        const result = await client.searchCustomers(options.email);
        outputJson(result.entries);
      })
    );

  cmd
    .command('activities')
    .description('List customer activities')
    .argument('<uuid>', 'Customer UUID')
    .option('--page <number>', 'Page number')
    .option('--per-page <number>', 'Results per page')
    .action(
      withErrorHandling(async (uuid: string, options: { page?: string; perPage?: string }) => {
        const result = await client.getCustomerActivities(uuid, {
          page: options.page ? parseInt(options.page, 10) : undefined,
          per_page: options.perPage ? parseInt(options.perPage, 10) : undefined,
        });
        outputJson(result);
      })
    );

  cmd
    .command('subscriptions')
    .description('List customer subscriptions')
    .argument('<uuid>', 'Customer UUID')
    .action(
      withErrorHandling(async (uuid: string) => {
        const result = await client.getCustomerSubscriptions(uuid);
        outputJson(result.entries);
      })
    );

  return cmd;
}

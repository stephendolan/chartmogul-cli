import { Command } from 'commander';
import { client } from '../lib/api-client.js';
import { config } from '../lib/config.js';
import { outputJson } from '../lib/output.js';
import { withErrorHandling } from '../lib/command-utils.js';

export function createInvoicesCommand(): Command {
  const cmd = new Command('invoices').description('Invoice queries');

  cmd
    .command('list')
    .description('List invoices')
    .option('--customer <uuid>', 'Filter by customer UUID')
    .option('--data-source <uuid>', 'Filter by data source UUID')
    .option('--external-id <id>', 'Filter by external ID')
    .option('--page <number>', 'Page number')
    .option('--per-page <number>', 'Results per page')
    .action(
      withErrorHandling(
        async (options: {
          customer?: string;
          dataSource?: string;
          externalId?: string;
          page?: string;
          perPage?: string;
        }) => {
          const result = await client.listInvoices({
            customer_uuid: options.customer,
            data_source_uuid: options.dataSource || config.getDefaultDataSource(),
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
    .description('View an invoice')
    .argument('<uuid>', 'Invoice UUID')
    .action(
      withErrorHandling(async (uuid: string) => {
        const invoice = await client.getInvoice(uuid);
        outputJson(invoice);
      })
    );

  return cmd;
}

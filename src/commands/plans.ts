import { Command } from 'commander';
import { client } from '../lib/api-client.js';
import { config } from '../lib/config.js';
import { outputJson } from '../lib/output.js';
import { withErrorHandling } from '../lib/command-utils.js';

export function createPlansCommand(): Command {
  const cmd = new Command('plans').description('Plan queries');

  cmd
    .command('list')
    .description('List plans')
    .option('--data-source <uuid>', 'Filter by data source UUID')
    .option('--page <number>', 'Page number')
    .option('--per-page <number>', 'Results per page')
    .action(
      withErrorHandling(
        async (options: { dataSource?: string; page?: string; perPage?: string }) => {
          const result = await client.listPlans({
            data_source_uuid: options.dataSource || config.getDefaultDataSource(),
            page: options.page ? parseInt(options.page, 10) : undefined,
            per_page: options.perPage ? parseInt(options.perPage, 10) : undefined,
          });
          outputJson(result);
        }
      )
    );

  cmd
    .command('view')
    .description('View a plan')
    .argument('<uuid>', 'Plan UUID')
    .action(
      withErrorHandling(async (uuid: string) => {
        const plan = await client.getPlan(uuid);
        outputJson(plan);
      })
    );

  return cmd;
}

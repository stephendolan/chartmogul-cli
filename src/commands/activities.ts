import { Command } from 'commander';
import { client } from '../lib/api-client.js';
import { outputJson } from '../lib/output.js';
import { withErrorHandling } from '../lib/command-utils.js';

export function createActivitiesCommand(): Command {
  const cmd = new Command('activities').description('Activity operations');

  cmd
    .command('list')
    .description('List activities')
    .option('--start-date <date>', 'Start date (YYYY-MM-DD)')
    .option('--end-date <date>', 'End date (YYYY-MM-DD)')
    .option('--type <type>', 'Activity type (new_biz, expansion, contraction, churn, reactivation)')
    .option('--page <number>', 'Page number')
    .option('--per-page <number>', 'Results per page')
    .action(
      withErrorHandling(
        async (options: {
          startDate?: string;
          endDate?: string;
          type?: string;
          page?: string;
          perPage?: string;
        }) => {
          const result = await client.listActivities({
            'start-date': options.startDate,
            'end-date': options.endDate,
            type: options.type,
            page: options.page ? parseInt(options.page, 10) : undefined,
            per_page: options.perPage ? parseInt(options.perPage, 10) : undefined,
          });
          outputJson(result);
        }
      )
    );

  return cmd;
}

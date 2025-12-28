import { Command } from 'commander';
import { client } from '../lib/api-client.js';
import { config } from '../lib/config.js';
import { outputJson } from '../lib/output.js';
import { withErrorHandling } from '../lib/command-utils.js';

export function createDataSourcesCommand(): Command {
  const cmd = new Command('data-sources').description('Data source operations');

  cmd
    .command('list')
    .description('List all data sources')
    .action(
      withErrorHandling(async () => {
        const result = await client.listDataSources();
        outputJson(result.data_sources);
      })
    );

  cmd
    .command('view')
    .description('View a data source')
    .argument('<uuid>', 'Data source UUID')
    .action(
      withErrorHandling(async (uuid: string) => {
        const dataSource = await client.getDataSource(uuid);
        outputJson(dataSource);
      })
    );

  cmd
    .command('set-default')
    .description('Set default data source for filtering')
    .argument('<uuid>', 'Data source UUID')
    .action(
      withErrorHandling(async (uuid: string) => {
        config.setDefaultDataSource(uuid);
        outputJson({ message: `Default data source set to ${uuid}` });
      })
    );

  cmd
    .command('get-default')
    .description('Get default data source')
    .action(
      withErrorHandling(async () => {
        const defaultDs = config.getDefaultDataSource();
        outputJson({ default_data_source: defaultDs || null });
      })
    );

  return cmd;
}

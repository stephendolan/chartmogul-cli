import { Command } from 'commander';
import { client } from '../lib/api-client.js';
import { outputJson } from '../lib/output.js';
import { withErrorHandling } from '../lib/command-utils.js';

export function createAccountCommand(): Command {
  const cmd = new Command('account').description('Account operations');

  cmd
    .command('view')
    .description('View account details')
    .action(
      withErrorHandling(async () => {
        const account = await client.getAccount();
        outputJson(account);
      })
    );

  return cmd;
}

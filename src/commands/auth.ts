import { Command } from 'commander';
import { auth } from '../lib/auth.js';
import { client } from '../lib/api-client.js';
import { outputJson } from '../lib/output.js';
import { withErrorHandling } from '../lib/command-utils.js';

export function createAuthCommand(): Command {
  const cmd = new Command('auth').description('Authentication operations');

  cmd
    .command('login')
    .description('Configure ChartMogul API credentials')
    .requiredOption('--api-key <key>', 'ChartMogul API Key')
    .action(
      withErrorHandling(async (options: { apiKey: string }) => {
        auth.setApiKey(options.apiKey);
        await client.ping();
        outputJson({ message: 'Successfully authenticated with ChartMogul' });
      })
    );

  cmd
    .command('logout')
    .description('Remove stored credentials')
    .action(
      withErrorHandling(async () => {
        auth.logout();
        outputJson({ message: 'Logged out successfully' });
      })
    );

  cmd
    .command('status')
    .description('Check authentication status')
    .action(
      withErrorHandling(async () => {
        outputJson({ authenticated: auth.isAuthenticated() });
      })
    );

  return cmd;
}

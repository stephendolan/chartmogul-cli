#!/usr/bin/env bun

import { Command } from 'commander';
import { setOutputOptions } from './lib/output.js';
import { createAuthCommand } from './commands/auth.js';
import { createAccountCommand } from './commands/account.js';
import { createDataSourcesCommand } from './commands/data-sources.js';
import { createCustomersCommand } from './commands/customers.js';
import { createPlansCommand } from './commands/plans.js';
import { createInvoicesCommand } from './commands/invoices.js';
import { createMetricsCommand } from './commands/metrics.js';
import { createActivitiesCommand } from './commands/activities.js';

declare const __VERSION__: string | undefined;

const version = typeof __VERSION__ !== 'undefined' ? __VERSION__ : '0.0.0-dev';

const program = new Command();

program
  .name('chartmogul')
  .description('A command-line interface for ChartMogul analytics')
  .version(version)
  .option('-c, --compact', 'Minified JSON output (single line)')
  .hook('preAction', (thisCommand) => {
    const options = thisCommand.opts();
    setOutputOptions({
      compact: options.compact,
    });
  });

program.addCommand(createAuthCommand());
program.addCommand(createAccountCommand());
program.addCommand(createDataSourcesCommand());
program.addCommand(createCustomersCommand());
program.addCommand(createPlansCommand());
program.addCommand(createInvoicesCommand());
program.addCommand(createMetricsCommand());
program.addCommand(createActivitiesCommand());

program.parseAsync().catch(() => {
  process.exit(1);
});

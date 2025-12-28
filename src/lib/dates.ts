import dayjs from 'dayjs';
import { ChartMogulCliError } from './errors.js';

export function parseDate(input: string): string {
  const d = dayjs(input);
  if (!d.isValid()) {
    throw new ChartMogulCliError(`Invalid date: ${input}`, 400);
  }
  return d.format('YYYY-MM-DD');
}

export function getDefaultDateRange(): { startDate: string; endDate: string } {
  return {
    startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
  };
}

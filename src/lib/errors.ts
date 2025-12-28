import type { ChartMogulError } from '../types/index.js';
import { outputJson } from './output.js';

export class ChartMogulCliError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ChartMogulCliError';
  }
}

export class ChartMogulApiError extends Error {
  constructor(
    message: string,
    public apiError: unknown,
    public statusCode: number
  ) {
    super(message);
    this.name = 'ChartMogulApiError';
  }
}

export function sanitizeErrorMessage(message: string): string {
  const sensitivePatterns = [
    /Bearer\s+[\w\-._~+/]+=*/gi,
    /token[=:]\s*[\w\-._~+/]+=*/gi,
    /api[_-]?key[=:]\s*[\w\-._~+/]+=*/gi,
    /authorization:\s*basic\s+[\w\-._~+/]+=*/gi,
  ];

  let sanitized = message;
  for (const pattern of sensitivePatterns) {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  }

  return sanitized.length > 500 ? sanitized.substring(0, 500) + '...' : sanitized;
}

interface ApiErrorResponse {
  error?: string;
  message?: string;
  errors?: Array<{
    key?: string;
    message?: string;
  }>;
}

function isErrorObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function sanitizeApiError(error: unknown): ChartMogulError {
  if (!isErrorObject(error)) {
    return {
      name: 'api_error',
      detail: 'An error occurred',
    };
  }

  const apiError = error as ApiErrorResponse;

  let detail = 'An error occurred';
  if (apiError.message) {
    detail = apiError.message;
  } else if (apiError.errors?.length) {
    detail = apiError.errors
      .map((e) => e.message || e.key)
      .filter(Boolean)
      .join('; ');
  }

  return {
    name: apiError.error || 'api_error',
    detail: sanitizeErrorMessage(detail),
  };
}

function formatErrorResponse(name: string, detail: string, statusCode: number): never {
  const hint =
    name === 'too_many_requests'
      ? 'ChartMogul API rate limit exceeded. Wait a moment and retry.'
      : undefined;

  const response: { error: { name: string; detail: string; statusCode: number }; hint?: string } = {
    error: { name, detail, statusCode },
  };

  if (hint) {
    response.hint = hint;
  }

  outputJson(response);
  process.exit(1);
}

export function handleChartMogulError(error: unknown): never {
  if (error instanceof ChartMogulCliError) {
    const sanitized = sanitizeErrorMessage(error.message);
    formatErrorResponse('cli_error', sanitized, error.statusCode || 1);
  }

  if (error instanceof ChartMogulApiError) {
    const cmError = sanitizeApiError(error.apiError);
    formatErrorResponse(cmError.name, cmError.detail, error.statusCode);
  }

  if (error instanceof Error) {
    const sanitized = sanitizeErrorMessage(error.message);
    formatErrorResponse('unknown_error', sanitized, 1);
  }

  formatErrorResponse('unknown_error', 'An unexpected error occurred', 1);
}

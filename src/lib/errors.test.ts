import { describe, expect, it } from 'vitest';
import { sanitizeErrorMessage, sanitizeApiError } from './errors.js';

describe('sanitizeErrorMessage', () => {
  it('redacts Bearer tokens', () => {
    expect(sanitizeErrorMessage('Bearer abc123xyz')).toBe('[REDACTED]');
  });

  it('redacts api_key values', () => {
    expect(sanitizeErrorMessage('api_key=secret123')).toBe('[REDACTED]');
    expect(sanitizeErrorMessage('api-key: secret123')).toBe('[REDACTED]');
  });

  it('redacts token values', () => {
    expect(sanitizeErrorMessage('token=mysecret')).toBe('[REDACTED]');
    expect(sanitizeErrorMessage('token: mysecret')).toBe('[REDACTED]');
  });

  it('redacts Basic auth headers', () => {
    expect(sanitizeErrorMessage('Authorization: Basic dXNlcjpwYXNz')).toBe('[REDACTED]');
  });

  it('truncates long messages', () => {
    const longMessage = 'a'.repeat(600);
    const result = sanitizeErrorMessage(longMessage);
    expect(result.length).toBe(503);
    expect(result.endsWith('...')).toBe(true);
  });

  it('preserves safe messages', () => {
    expect(sanitizeErrorMessage('Not found')).toBe('Not found');
  });
});

describe('sanitizeApiError', () => {
  it('handles non-object errors', () => {
    expect(sanitizeApiError('string error')).toEqual({
      name: 'api_error',
      detail: 'An error occurred',
    });
  });

  it('extracts message from API error', () => {
    expect(sanitizeApiError({ message: 'Customer not found' })).toEqual({
      name: 'api_error',
      detail: 'Customer not found',
    });
  });

  it('extracts error name from API error', () => {
    expect(sanitizeApiError({ error: 'not_found', message: 'Resource missing' })).toEqual({
      name: 'not_found',
      detail: 'Resource missing',
    });
  });

  it('handles errors array', () => {
    expect(
      sanitizeApiError({
        errors: [{ message: 'Field required' }, { key: 'email' }],
      })
    ).toEqual({
      name: 'api_error',
      detail: 'Field required; email',
    });
  });

  it('redacts sensitive info in error messages', () => {
    expect(sanitizeApiError({ message: 'Auth failed: Bearer token123' })).toEqual({
      name: 'api_error',
      detail: 'Auth failed: [REDACTED]',
    });
  });
});

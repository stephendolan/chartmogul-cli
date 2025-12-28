import { Entry } from '@napi-rs/keyring';
import { config } from './config.js';

const SERVICE_NAME = 'chartmogul-cli';
const API_KEY_ACCOUNT = 'api-key';

const KEYRING_UNAVAILABLE_ERROR =
  'Keychain storage unavailable. Cannot store credentials securely.\n' +
  'On Linux, install libsecret: sudo apt-get install libsecret-1-dev\n' +
  'Then reinstall: bun install -g @stephendolan/chartmogul-cli\n' +
  'Alternatively, use CHARTMOGUL_API_KEY environment variable.';

function getKeyring(account: string): Entry | null {
  try {
    return new Entry(SERVICE_NAME, account);
  } catch {
    return null;
  }
}

function getPassword(account: string): string | null {
  const entry = getKeyring(account);
  if (entry) {
    try {
      return entry.getPassword();
    } catch {
      return null;
    }
  }
  return null;
}

function setPassword(account: string, value: string): void {
  const entry = getKeyring(account);
  if (!entry) {
    throw new Error(KEYRING_UNAVAILABLE_ERROR);
  }
  entry.setPassword(value);
}

function deletePassword(account: string): boolean {
  const entry = getKeyring(account);
  if (entry) {
    return entry.deletePassword();
  }
  return false;
}

export class AuthManager {
  getApiKey(): string | null {
    return getPassword(API_KEY_ACCOUNT) || process.env.CHARTMOGUL_API_KEY || null;
  }

  setApiKey(apiKey: string): void {
    setPassword(API_KEY_ACCOUNT, apiKey);
  }

  isAuthenticated(): boolean {
    return this.getApiKey() !== null;
  }

  logout(): void {
    deletePassword(API_KEY_ACCOUNT);
    config.clearDefaultDataSource();
  }
}

export const auth = new AuthManager();

import { registerAs } from '@nestjs/config';
import process from 'node:process';

import { InvalidConfigurationException } from '@/common/infrastructure/config/exceptions/invalid-configuration.exception';

const DEFAULT_ACCESS_TOKEN_TTL_MS = 900_000;
const DEFAULT_REFRESH_TOKEN_TTL_MS = 86_400_000;
const DEFAULT_REMEMBER_ME_REFRESH_TOKEN_TTL_MS = 2_592_000_000;
const DEFAULT_ADMIN_REFRESH_TOKEN_TTL_MS = 28_800_000;

function readTokenTtl(environmentKey: string, defaultTtlMs: number): number {
  const ttlMs = Number(process.env[environmentKey] ?? defaultTtlMs);

  if (!Number.isSafeInteger(ttlMs) || ttlMs <= 0) {
    throw new InvalidConfigurationException(
      environmentKey,
      'must be a positive safe integer',
    );
  }

  return ttlMs;
}

export const authConfig = registerAs('auth', () => ({
  expiresIn: readTokenTtl('AUTH_ACCESS_TOKEN_TTL_MS', DEFAULT_ACCESS_TOKEN_TTL_MS),
  refreshExpiresIn: readTokenTtl('AUTH_REFRESH_TOKEN_TTL_MS', DEFAULT_REFRESH_TOKEN_TTL_MS),
  rememberMeRefreshExpiresIn: readTokenTtl(
    'AUTH_REMEMBER_ME_REFRESH_TOKEN_TTL_MS',
    DEFAULT_REMEMBER_ME_REFRESH_TOKEN_TTL_MS,
  ),
  adminRefreshExpiresIn: readTokenTtl(
    'AUTH_ADMIN_REFRESH_TOKEN_TTL_MS',
    DEFAULT_ADMIN_REFRESH_TOKEN_TTL_MS,
  ),
}));

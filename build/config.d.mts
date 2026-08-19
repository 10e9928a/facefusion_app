export function validateClientEnvironment(
  env: Record<string, string | undefined>,
  production?: boolean,
): void;

export function validatePlatformIdentity(
  manifest: Record<string, unknown>,
  platform: string | undefined,
): void;

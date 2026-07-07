import { AuthConfigError } from './env';
import { AuthRequestError } from './wordpress-client';

export function getAuthRouteError(error: unknown, fallbackMessage: string) {
  if (error instanceof AuthConfigError) {
    return { status: error.status, message: error.message };
  }

  if (error instanceof AuthRequestError) {
    return { status: error.status, message: error.message };
  }

  if (error instanceof Error) {
    return { status: 500, message: error.message };
  }

  return { status: 500, message: fallbackMessage };
}

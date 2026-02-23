import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';

const DEFAULT_MS = 8000;

/**
 * Send a message to a microservice and return the result, or a fallback value on connection error/timeout.
 * Use this in the gateway so that when a service is down we return fallback instead of 500.
 */
export async function sendWithFallback<T>(
  client: ClientProxy,
  pattern: object,
  payload: any,
  fallback: T,
  timeoutMs: number = DEFAULT_MS,
): Promise<T> {
  try {
    const result = await firstValueFrom(
      client.send(pattern, payload).pipe(
        timeout(timeoutMs),
        catchError(() => of(fallback)),
      ),
    );
    return result ?? fallback;
  } catch {
    return fallback;
  }
}

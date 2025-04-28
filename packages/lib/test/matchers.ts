import { vi } from 'vitest';

export function toHaveBeenCalledWithEvent(received: ReturnType<typeof vi.fn>, eventName: string, ...args: unknown[]) {
  const calls = received.mock.calls;
  const pass = calls.some(call => call[0] === eventName && call.slice(1).every((arg, i) => arg === args[i]));
  return {
    pass,
    message: () => `expected ${received.getMockName()} to have been called with event "${eventName}" and args ${JSON.stringify(args)}`
  };
} 
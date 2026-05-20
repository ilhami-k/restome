import { randomId } from './ids';

export function createChannelName(name: string): string {
  return `${name}:${randomId()}`;
}

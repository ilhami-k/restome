export function randomId(prefix?: string): string {
  const value = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return prefix ? `${prefix}-${value}` : value;
}

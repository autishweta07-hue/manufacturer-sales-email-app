export function sendingEnabled(): boolean {
  return process.env.ALLOW_SENDING === 'true';
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatDateTime(iso?: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

export function normalizeEmail(value: unknown): string {
  if (typeof value === 'number') return '';
  return String(value ?? '')
    .trim()
    .replace(/^<|>$/g, '')
    .toLowerCase();
}

export function isEmail(value: string): boolean {
  if (value.length > 254 || value.length < 3) return false;
  return /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(
    value
  );
}

export function splitEmails(value: unknown): string[] {
  const raw = String(value ?? '').trim();
  if (!raw) return [];
  return raw
    .split(/[\/,\s;]+/)
    .map((part) => normalizeEmail(part))
    .filter((part) => part.length > 0);
}

export function safeErrorMessage(error: unknown): string {
  if (!error) return 'Unknown error';
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[email]').slice(0, 240);
}

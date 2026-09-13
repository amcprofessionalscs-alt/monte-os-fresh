import { isNative, VERCEL_URL } from './native';

// In native apps, API routes aren't available locally — proxy to Vercel.
export function apiUrl(path: string): string {
  return isNative ? `${VERCEL_URL}${path}` : path;
}

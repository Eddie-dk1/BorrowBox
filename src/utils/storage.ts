export const STORAGE_KEYS = {
  users: 'borrowbox_users',
  items: 'borrowbox_items',
  bookings: 'borrowbox_bookings',
  reviews: 'borrowbox_reviews',
  notifications: 'borrowbox_notifications'
} as const;

export function readJson<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    if (!value) return fallback;
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

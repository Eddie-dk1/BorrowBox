export const STORAGE_KEYS = {
  items: 'borrowbox_items',
  bookings: 'borrowbox_bookings',
  reviews: 'borrowbox_reviews',
  notifications: 'borrowbox_notifications'
};

export function readJson(key, fallback = []) {
  try {
    const value = localStorage.getItem(key);
    if (!value) return fallback;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

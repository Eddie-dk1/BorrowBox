import { mockItems } from '../data/mockItems';
import { mockNotifications } from '../data/mockNotifications';
import { mockReviews } from '../data/mockReviews';
import { currentUserId, mockUsers } from '../data/mockUsers';
import type {
  Booking,
  BookingStatus,
  CreateUserInput,
  CreateBookingInput,
  CreateItemInput,
  Item,
  Notification,
  NotificationType,
  OwnerPublicStats,
  Review,
  UpdateItemInput,
  User
} from '../types/domain';
import { getSessionUserId } from './auth';
import { diffCalendarDaysInclusive, rangesOverlap } from './date';
import { calculateTotalPrice } from './price';
import { readJson, STORAGE_KEYS, writeJson } from './storage';

const OLD_MACBOOK_IMAGE =
  'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1200&q=80';
const NEW_MACBOOK_IMAGE =
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80';

function getFavoritesKey(userId: string = currentUserId): string {
  return `borrowbox_favorites_${userId}`;
}

function getActiveUserId(): string {
  return getSessionUserId() || currentUserId;
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function emitNotificationsChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('borrowbox:notifications-changed'));
  }
}

function emitToast(payload: { id: string; message: string; link: string }): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('borrowbox:toast', { detail: payload }));
  }
}

export function initializeStore(): void {
  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    writeJson(STORAGE_KEYS.users, mockUsers);
  }
  if (!localStorage.getItem(STORAGE_KEYS.items)) {
    writeJson(STORAGE_KEYS.items, mockItems);
  }
  if (!localStorage.getItem(STORAGE_KEYS.bookings)) {
    writeJson(STORAGE_KEYS.bookings, [] as Booking[]);
  }
  if (!localStorage.getItem(STORAGE_KEYS.reviews)) {
    writeJson(STORAGE_KEYS.reviews, mockReviews);
  }
  if (!localStorage.getItem(STORAGE_KEYS.notifications)) {
    writeJson(STORAGE_KEYS.notifications, mockNotifications);
  }
  if (!localStorage.getItem(getFavoritesKey())) {
    writeJson(getFavoritesKey(), [] as string[]);
  }

  const users = readJson<User[]>(STORAGE_KEYS.users, mockUsers as User[]);
  const migratedUsers = users.map((user) => {
    if (user.email && user.password) return user;
    const fallbackEmail = `${user.name.toLowerCase().replace(/\s+/g, '.')}@borrowbox.local`;
    return {
      ...user,
      email: user.email || fallbackEmail,
      password: user.password || 'demo12345'
    };
  });
  writeJson(STORAGE_KEYS.users, migratedUsers);

  const items = readJson<Item[]>(STORAGE_KEYS.items, []);
  const migrated = items.map((item) => {
    if (item.id === 'item_3' && item.image === OLD_MACBOOK_IMAGE) {
      return { ...item, image: NEW_MACBOOK_IMAGE };
    }
    return item;
  });
  writeJson(STORAGE_KEYS.items, migrated);
}

export function getUsers(): User[] {
  return readJson<User[]>(STORAGE_KEYS.users, mockUsers as User[]);
}

export function getUserById(userId: string): User | undefined {
  return getUsers().find((user) => user.id === userId);
}

export function getCurrentUser(): User {
  const userId = getActiveUserId();
  const users = getUsers();
  return (users.find((user) => user.id === userId) || users[0]) as User;
}

export function addUser(payload: CreateUserInput): User {
  const name = payload.name.trim();
  const city = payload.city.trim();
  const email = normalizeEmail(payload.email);
  const password = payload.password.trim();
  if (!name || !city || !email || !password) {
    throw new Error('Name, city, email, and password are required');
  }
  if (!email.includes('@')) {
    throw new Error('Enter a valid email');
  }
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const users = getUsers();
  if (users.some((user) => normalizeEmail(user.email) === email)) {
    throw new Error('Email is already in use');
  }
  const newUser: User = {
    id: `user_${crypto.randomUUID()}`,
    name,
    city,
    email,
    password
  };
  writeJson(STORAGE_KEYS.users, [newUser, ...users]);
  return newUser;
}

export function authenticateUser(email: string, password: string): User {
  const normalizedEmail = normalizeEmail(email);
  const user = getUsers().find((entry) => normalizeEmail(entry.email) === normalizedEmail);
  if (!user || user.password !== password) {
    throw new Error('Invalid email or password');
  }
  return user;
}

export function getItems(): Item[] {
  return readJson<Item[]>(STORAGE_KEYS.items, []);
}

export function getItemById(itemId: string): Item | undefined {
  return getItems().find((item) => item.id === itemId);
}

export function addItem(payload: CreateItemInput): Item {
  const owner = getCurrentUser();
  const newItem: Item = {
    id: `item_${crypto.randomUUID()}`,
    title: payload.title,
    category: payload.category,
    pricePerDay: Number(payload.pricePerDay),
    city: payload.city,
    condition: payload.condition,
    description: payload.description,
    image: payload.image,
    ownerId: owner.id,
    ownerName: owner.name,
    deposit: payload.deposit ? Number(payload.deposit) : 0,
    createdAt: new Date().toISOString(),
    isActive: true
  };

  const items = getItems();
  writeJson(STORAGE_KEYS.items, [newItem, ...items]);
  return newItem;
}

export function updateItem(itemId: string, payload: UpdateItemInput): Item | undefined {
  const activeUserId = getActiveUserId();
  const items = getItems();
  const existing = items.find((item) => item.id === itemId);
  if (!existing) throw new Error('Item not found');
  if (existing.ownerId !== activeUserId) throw new Error('Only owner can edit this listing');

  const next = items.map((item) => {
    if (item.id !== itemId) return item;
    return {
      ...item,
      title: payload.title,
      category: payload.category,
      pricePerDay: Number(payload.pricePerDay),
      city: payload.city,
      condition: payload.condition,
      description: payload.description,
      image: payload.image,
      deposit: payload.deposit ? Number(payload.deposit) : 0
    };
  });

  writeJson(STORAGE_KEYS.items, next);
  return next.find((item) => item.id === itemId);
}

export function getBookings(): Booking[] {
  return readJson<Booking[]>(STORAGE_KEYS.bookings, []);
}

export function getNotifications(): Notification[] {
  const activeUserId = getActiveUserId();
  return readJson<Notification[]>(STORAGE_KEYS.notifications, [])
    .filter((notification) => notification.userId === activeUserId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getUnreadNotificationsCount(): number {
  return getNotifications().filter((notification) => !notification.isRead).length;
}

export function markAllNotificationsRead(): void {
  const activeUserId = getActiveUserId();
  const notifications = readJson<Notification[]>(STORAGE_KEYS.notifications, []);
  const next = notifications.map((notification) => {
    if (notification.userId !== activeUserId) return notification;
    return { ...notification, isRead: true };
  });
  writeJson(STORAGE_KEYS.notifications, next);
  emitNotificationsChanged();
}

export function markNotificationRead(notificationId: string): void {
  const activeUserId = getActiveUserId();
  const notifications = readJson<Notification[]>(STORAGE_KEYS.notifications, []);
  const next = notifications.map((notification) => {
    if (notification.id !== notificationId) return notification;
    if (notification.userId !== activeUserId) return notification;
    return { ...notification, isRead: true };
  });
  writeJson(STORAGE_KEYS.notifications, next);
  emitNotificationsChanged();
}

function addNotification({
  userId,
  type,
  message,
  link = '/dashboard'
}: {
  userId: string;
  type: NotificationType;
  message: string;
  link?: string;
}): void {
  const notifications = readJson<Notification[]>(STORAGE_KEYS.notifications, []);
  const newNotification: Notification = {
    id: `note_${crypto.randomUUID()}`,
    userId,
    type,
    message,
    isRead: false,
    createdAt: new Date().toISOString(),
    link
  };
  const next = [newNotification, ...notifications];
  writeJson(STORAGE_KEYS.notifications, next);
  emitNotificationsChanged();
  if (userId === getActiveUserId()) {
    emitToast({
      id: newNotification.id,
      message: newNotification.message,
      link: newNotification.link
    });
  }
}

export function getReviews(): Review[] {
  return readJson<Review[]>(STORAGE_KEYS.reviews, []);
}

export function getReviewsByOwnerId(ownerId: string): Review[] {
  return getReviews()
    .filter((review) => review.ownerId === ownerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getOwnerPublicStats(ownerId: string): OwnerPublicStats {
  const listings = getItems().filter((item) => item.ownerId === ownerId);
  const ownerBookings = getBookings().filter((booking) => booking.ownerId === ownerId);
  const reviews = getReviewsByOwnerId(ownerId);

  const avgRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return {
    listingCount: listings.length,
    requestsReceived: ownerBookings.length,
    approvedCount: ownerBookings.filter((booking) => booking.status === 'approved').length,
    pendingCount: ownerBookings.filter((booking) => booking.status === 'pending').length,
    revenueApproved: ownerBookings
      .filter((booking) => booking.status === 'approved')
      .reduce((sum, booking) => sum + booking.totalPrice, 0),
    reviewCount: reviews.length,
    avgRating
  };
}

function hasConflict(itemId: string, startDate: string, endDate: string): boolean {
  return getBookings().some((booking) => {
    if (booking.itemId !== itemId) return false;
    if (!['pending', 'approved'].includes(booking.status)) return false;
    return rangesOverlap(startDate, endDate, booking.startDate, booking.endDate);
  });
}

export function getActiveBookingsForItem(itemId: string): Booking[] {
  return getBookings()
    .filter(
      (booking) => booking.itemId === itemId && ['pending', 'approved'].includes(booking.status)
    )
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
}

export function hasBookingConflict(itemId: string, startDate: string, endDate: string): boolean {
  if (!itemId || !startDate || !endDate) return false;
  return hasConflict(itemId, startDate, endDate);
}

export function createBooking({ itemId, startDate, endDate }: CreateBookingInput): Booking {
  const activeUserId = getActiveUserId();
  const item = getItemById(itemId);
  if (!item) throw new Error('Item not found');
  if (item.ownerId === activeUserId) throw new Error('You cannot book your own item');
  if (!startDate || !endDate) throw new Error('Both dates are required');
  if (endDate < startDate) throw new Error('End date must be after start date');
  if (hasConflict(itemId, startDate, endDate)) {
    throw new Error('Selected dates overlap an existing booking');
  }

  const totalDays = diffCalendarDaysInclusive(startDate, endDate);
  if (totalDays < 1) throw new Error('Minimum rental is 1 day');

  const newBooking: Booking = {
    id: `booking_${crypto.randomUUID()}`,
    itemId,
    renterId: activeUserId,
    ownerId: item.ownerId,
    startDate,
    endDate,
    totalDays,
    totalPrice: calculateTotalPrice(totalDays, item.pricePerDay),
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  const bookings = getBookings();
  writeJson(STORAGE_KEYS.bookings, [newBooking, ...bookings]);

  addNotification({
    userId: item.ownerId,
    type: 'booking_request',
    message: `New request for "${item.title}" (${startDate} to ${endDate}).`,
    link: '/dashboard'
  });
  return newBooking;
}

export function updateBookingStatus(bookingId: string, status: BookingStatus): void {
  const activeUserId = getActiveUserId();
  const allowed: BookingStatus[] = ['approved', 'declined', 'cancelled'];
  if (!allowed.includes(status)) throw new Error('Invalid booking status');

  const bookings = getBookings();
  const targetBooking = bookings.find((booking) => booking.id === bookingId);
  if (!targetBooking) throw new Error('Booking not found');
  if (targetBooking.ownerId !== activeUserId) {
    throw new Error('Only owner can update status');
  }

  let autoDeclinedCount = 0;
  const next = bookings.map((booking) => {
    if (booking.id === bookingId) {
      return { ...booking, status };
    }

    if (
      status === 'approved' &&
      booking.itemId === targetBooking.itemId &&
      booking.status === 'pending' &&
      rangesOverlap(
        targetBooking.startDate,
        targetBooking.endDate,
        booking.startDate,
        booking.endDate
      )
    ) {
      autoDeclinedCount += 1;
      return { ...booking, status: 'declined' as BookingStatus };
    }

    return booking;
  });

  writeJson(STORAGE_KEYS.bookings, next);

  const item = getItemById(targetBooking.itemId);
  const itemTitle = item?.title || targetBooking.itemId;
  if (status === 'approved') {
    addNotification({
      userId: targetBooking.renterId,
      type: 'booking_status',
      message: `Your request for "${itemTitle}" was approved.`,
      link: '/dashboard'
    });
  }
  if (status === 'declined' || status === 'cancelled') {
    addNotification({
      userId: targetBooking.renterId,
      type: 'booking_status',
      message: `Your request for "${itemTitle}" was ${status}.`,
      link: '/dashboard'
    });
  }

  if (status === 'approved' && autoDeclinedCount > 0) {
    next
      .filter(
        (booking) =>
          booking.itemId === targetBooking.itemId &&
          booking.status === 'declined' &&
          booking.id !== bookingId
      )
      .forEach((declinedBooking) => {
        addNotification({
          userId: declinedBooking.renterId,
          type: 'booking_status',
          message: `Your request for "${itemTitle}" was declined due to date conflict.`,
          link: '/dashboard'
        });
      });
  }
}

export function getFavorites(userId: string = getActiveUserId()): string[] {
  return readJson<string[]>(getFavoritesKey(userId), []);
}

export function toggleFavorite(itemId: string, userId: string = getActiveUserId()): string[] {
  const favorites = getFavorites(userId);
  const exists = favorites.includes(itemId);
  const next = exists ? favorites.filter((id) => id !== itemId) : [...favorites, itemId];

  writeJson(getFavoritesKey(userId), next);
  return next;
}

import { mockItems } from '../data/mockItems';
import { mockNotifications } from '../data/mockNotifications';
import { mockReviews } from '../data/mockReviews';
import { currentUserId, mockUsers } from '../data/mockUsers';
import { diffCalendarDaysInclusive, rangesOverlap } from './date';
import { calculateTotalPrice } from './price';
import { readJson, STORAGE_KEYS, writeJson } from './storage';

const OLD_MACBOOK_IMAGE =
  'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1200&q=80';
const NEW_MACBOOK_IMAGE =
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80';

function getFavoritesKey(userId = currentUserId) {
  return `borrowbox_favorites_${userId}`;
}

function emitNotificationsChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('borrowbox:notifications-changed'));
  }
}

function emitToast(payload) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('borrowbox:toast', { detail: payload }));
  }
}

export function initializeStore() {
  if (!localStorage.getItem(STORAGE_KEYS.items)) {
    writeJson(STORAGE_KEYS.items, mockItems);
  }
  if (!localStorage.getItem(STORAGE_KEYS.bookings)) {
    writeJson(STORAGE_KEYS.bookings, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.reviews)) {
    writeJson(STORAGE_KEYS.reviews, mockReviews);
  }
  if (!localStorage.getItem(STORAGE_KEYS.notifications)) {
    writeJson(STORAGE_KEYS.notifications, mockNotifications);
  }
  if (!localStorage.getItem(getFavoritesKey())) {
    writeJson(getFavoritesKey(), []);
  }

  const items = readJson(STORAGE_KEYS.items, []);
  const migrated = items.map((item) => {
    if (item.id === 'item_3' && item.image === OLD_MACBOOK_IMAGE) {
      return { ...item, image: NEW_MACBOOK_IMAGE };
    }
    return item;
  });
  writeJson(STORAGE_KEYS.items, migrated);
}

export function getUsers() {
  return mockUsers;
}

export function getUserById(userId) {
  return mockUsers.find((user) => user.id === userId);
}

export function getCurrentUser() {
  return mockUsers.find((user) => user.id === currentUserId) || mockUsers[0];
}

export function getItems() {
  return readJson(STORAGE_KEYS.items, []);
}

export function getItemById(itemId) {
  return getItems().find((item) => item.id === itemId);
}

export function addItem(payload) {
  const owner = getCurrentUser();
  const newItem = {
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

export function updateItem(itemId, payload) {
  const items = getItems();
  const existing = items.find((item) => item.id === itemId);
  if (!existing) throw new Error('Item not found');
  if (existing.ownerId !== currentUserId) throw new Error('Only owner can edit this listing');

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

export function getBookings() {
  return readJson(STORAGE_KEYS.bookings, []);
}

export function getNotifications() {
  return readJson(STORAGE_KEYS.notifications, [])
    .filter((notification) => notification.userId === currentUserId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getUnreadNotificationsCount() {
  return getNotifications().filter((notification) => !notification.isRead).length;
}

export function markAllNotificationsRead() {
  const notifications = readJson(STORAGE_KEYS.notifications, []);
  const next = notifications.map((notification) => {
    if (notification.userId !== currentUserId) return notification;
    return { ...notification, isRead: true };
  });
  writeJson(STORAGE_KEYS.notifications, next);
  emitNotificationsChanged();
}

export function markNotificationRead(notificationId) {
  const notifications = readJson(STORAGE_KEYS.notifications, []);
  const next = notifications.map((notification) => {
    if (notification.id !== notificationId) return notification;
    if (notification.userId !== currentUserId) return notification;
    return { ...notification, isRead: true };
  });
  writeJson(STORAGE_KEYS.notifications, next);
  emitNotificationsChanged();
}

function addNotification({ userId, type, message, link = '/dashboard' }) {
  const notifications = readJson(STORAGE_KEYS.notifications, []);
  const newNotification = {
    id: `note_${crypto.randomUUID()}`,
    userId,
    type,
    message,
    isRead: false,
    createdAt: new Date().toISOString(),
    link
  };
  const next = [
    newNotification,
    ...notifications
  ];
  writeJson(STORAGE_KEYS.notifications, next);
  emitNotificationsChanged();
  if (userId === currentUserId) {
    emitToast({
      id: newNotification.id,
      message: newNotification.message,
      link: newNotification.link
    });
  }
}

export function getReviews() {
  return readJson(STORAGE_KEYS.reviews, []);
}

export function getReviewsByOwnerId(ownerId) {
  return getReviews()
    .filter((review) => review.ownerId === ownerId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getOwnerPublicStats(ownerId) {
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

function hasConflict(itemId, startDate, endDate) {
  return getBookings().some((booking) => {
    if (booking.itemId !== itemId) return false;
    if (!['pending', 'approved'].includes(booking.status)) return false;
    return rangesOverlap(startDate, endDate, booking.startDate, booking.endDate);
  });
}

export function getActiveBookingsForItem(itemId) {
  return getBookings()
    .filter(
      (booking) =>
        booking.itemId === itemId && ['pending', 'approved'].includes(booking.status)
    )
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
}

export function hasBookingConflict(itemId, startDate, endDate) {
  if (!itemId || !startDate || !endDate) return false;
  return hasConflict(itemId, startDate, endDate);
}

export function createBooking({ itemId, startDate, endDate }) {
  const item = getItemById(itemId);
  if (!item) throw new Error('Item not found');
  if (item.ownerId === currentUserId) throw new Error('You cannot book your own item');
  if (!startDate || !endDate) throw new Error('Both dates are required');
  if (endDate < startDate) throw new Error('End date must be after start date');
  if (hasConflict(itemId, startDate, endDate)) {
    throw new Error('Selected dates overlap an existing booking');
  }

  const totalDays = diffCalendarDaysInclusive(startDate, endDate);
  if (totalDays < 1) throw new Error('Minimum rental is 1 day');

  const newBooking = {
    id: `booking_${crypto.randomUUID()}`,
    itemId,
    renterId: currentUserId,
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

export function updateBookingStatus(bookingId, status) {
  const allowed = ['approved', 'declined', 'cancelled'];
  if (!allowed.includes(status)) throw new Error('Invalid booking status');

  const bookings = getBookings();
  const targetBooking = bookings.find((booking) => booking.id === bookingId);
  if (!targetBooking) throw new Error('Booking not found');
  if (targetBooking.ownerId !== currentUserId) {
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
      return { ...booking, status: 'declined' };
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

export function getFavorites(userId = currentUserId) {
  return readJson(getFavoritesKey(userId), []);
}

export function toggleFavorite(itemId, userId = currentUserId) {
  const favorites = getFavorites(userId);
  const exists = favorites.includes(itemId);
  const next = exists
    ? favorites.filter((id) => id !== itemId)
    : [...favorites, itemId];

  writeJson(getFavoritesKey(userId), next);
  return next;
}

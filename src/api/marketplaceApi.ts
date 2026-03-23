import * as store from '../utils/store';
import type {
  Booking,
  BookingStatus,
  CreateBookingInput,
  CreateItemInput,
  CreateUserInput,
  Item,
  Notification,
  OwnerPublicStats,
  Review,
  UpdateItemInput,
  User
} from '../types/domain';

export function initializeStore(): void {
  store.initializeStore();
}
export function getUsers(): User[] {
  return store.getUsers();
}
export function getUserById(userId: string): User | undefined {
  return store.getUserById(userId);
}
export function addUser(payload: CreateUserInput): User {
  return store.addUser(payload);
}
export function authenticateUser(email: string, password: string): User {
  return store.authenticateUser(email, password);
}
export function getCurrentUser(): User {
  return store.getCurrentUser();
}
export function getItems(): Item[] {
  return store.getItems();
}
export function getItemById(itemId: string): Item | undefined {
  return store.getItemById(itemId);
}
export function addItem(payload: CreateItemInput): Item {
  return store.addItem(payload);
}
export function updateItem(itemId: string, payload: UpdateItemInput): Item | undefined {
  return store.updateItem(itemId, payload);
}
export function getBookings(): Booking[] {
  return store.getBookings() as Booking[];
}
export function createBooking(payload: CreateBookingInput): Booking {
  return store.createBooking(payload) as Booking;
}
export function updateBookingStatus(bookingId: string, status: BookingStatus): void {
  store.updateBookingStatus(bookingId, status);
}
export function getActiveBookingsForItem(itemId: string): Booking[] {
  return store.getActiveBookingsForItem(itemId) as Booking[];
}
export function hasBookingConflict(itemId: string, startDate: string, endDate: string): boolean {
  return store.hasBookingConflict(itemId, startDate, endDate);
}
export function getNotifications(): Notification[] {
  return store.getNotifications() as Notification[];
}
export function getUnreadNotificationsCount(): number {
  return store.getUnreadNotificationsCount();
}
export function markAllNotificationsRead(): void {
  store.markAllNotificationsRead();
}
export function markNotificationRead(notificationId: string): void {
  store.markNotificationRead(notificationId);
}
export function getReviews(): Review[] {
  return store.getReviews() as Review[];
}
export function getReviewsByOwnerId(ownerId: string): Review[] {
  return store.getReviewsByOwnerId(ownerId) as Review[];
}
export function getOwnerPublicStats(ownerId: string): OwnerPublicStats {
  return store.getOwnerPublicStats(ownerId);
}
export function getFavorites(userId?: string): string[] {
  return store.getFavorites(userId);
}
export function toggleFavorite(itemId: string, userId?: string): string[] {
  return store.toggleFavorite(itemId, userId);
}

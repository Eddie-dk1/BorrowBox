export type ItemCondition = 'new' | 'good' | 'used';

export type BookingStatus = 'pending' | 'approved' | 'declined' | 'cancelled';

export type NotificationType = 'booking_request' | 'booking_status' | 'system';

export interface User {
  id: string;
  name: string;
  city: string;
  email: string;
  password: string;
  joinedAt?: string;
  avatar?: string;
  rating?: number;
  reviewCount?: number;
}

export interface CreateUserInput {
  name: string;
  city: string;
  email: string;
  password: string;
}

export interface Item {
  id: string;
  title: string;
  category: string;
  pricePerDay: number;
  city: string;
  condition: ItemCondition | string;
  description: string;
  image: string;
  ownerId: string;
  ownerName: string;
  deposit: number;
  createdAt: string;
  isActive: boolean;
}

export interface CreateItemInput {
  title: string;
  category: string;
  pricePerDay: number | string;
  city: string;
  condition: ItemCondition | string;
  description: string;
  image: string;
  deposit?: number | string;
}

export type UpdateItemInput = CreateItemInput;

export interface Booking {
  id: string;
  itemId: string;
  renterId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
}

export interface CreateBookingInput {
  itemId: string;
  startDate: string;
  endDate: string;
}

export interface Review {
  id: string;
  ownerId: string;
  renterId: string;
  bookingId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
  link: string;
}

export interface OwnerPublicStats {
  listingCount: number;
  requestsReceived: number;
  approvedCount: number;
  pendingCount: number;
  revenueApproved: number;
  reviewCount: number;
  avgRating: number;
}

import { beforeEach, describe, expect, it } from 'vitest';
import { currentUserId } from '../src/data/mockUsers';
import { STORAGE_KEYS, writeJson } from '../src/utils/storage';
import {
  addItem,
  createBooking,
  getBookings,
  getItems,
  initializeStore,
  updateBookingStatus
} from '../src/utils/store';

beforeEach(() => {
  localStorage.clear();
  initializeStore();
});

describe('store booking rules', () => {
  it('prevents booking overlap for pending/approved requests', () => {
    const item = getItems().find((entry) => entry.ownerId !== currentUserId);

    createBooking({
      itemId: item.id,
      startDate: '2026-04-10',
      endDate: '2026-04-12'
    });

    expect(() => {
      createBooking({
        itemId: item.id,
        startDate: '2026-04-12',
        endDate: '2026-04-14'
      });
    }).toThrow('Selected dates overlap an existing booking');
  });

  it('prevents booking own listing', () => {
    const ownItem = addItem({
      title: 'My Camera',
      category: 'Cameras',
      pricePerDay: 25,
      city: 'Moscow',
      condition: 'good',
      description: 'Owner listing',
      image: 'https://example.com/camera.jpg',
      deposit: 0
    });

    expect(() => {
      createBooking({
        itemId: ownItem.id,
        startDate: '2026-04-10',
        endDate: '2026-04-12'
      });
    }).toThrow('You cannot book your own item');
  });

  it('auto-declines overlapping pending requests after approval', () => {
    const ownItem = addItem({
      title: 'My Laptop',
      category: 'Laptops',
      pricePerDay: 35,
      city: 'Moscow',
      condition: 'good',
      description: 'Owner listing',
      image: 'https://example.com/laptop.jpg',
      deposit: 0
    });

    const bookings = [
      {
        id: 'booking_a',
        itemId: ownItem.id,
        renterId: 'user_2',
        ownerId: currentUserId,
        startDate: '2026-04-10',
        endDate: '2026-04-12',
        totalDays: 3,
        totalPrice: 105,
        status: 'pending',
        createdAt: '2026-03-23T10:00:00.000Z'
      },
      {
        id: 'booking_b',
        itemId: ownItem.id,
        renterId: 'user_3',
        ownerId: currentUserId,
        startDate: '2026-04-12',
        endDate: '2026-04-15',
        totalDays: 4,
        totalPrice: 140,
        status: 'pending',
        createdAt: '2026-03-23T10:05:00.000Z'
      },
      {
        id: 'booking_c',
        itemId: ownItem.id,
        renterId: 'user_2',
        ownerId: currentUserId,
        startDate: '2026-04-20',
        endDate: '2026-04-22',
        totalDays: 3,
        totalPrice: 105,
        status: 'pending',
        createdAt: '2026-03-23T10:10:00.000Z'
      }
    ];

    writeJson(STORAGE_KEYS.bookings, bookings);
    updateBookingStatus('booking_a', 'approved');

    const updated = getBookings();
    expect(updated.find((booking) => booking.id === 'booking_a')?.status).toBe('approved');
    expect(updated.find((booking) => booking.id === 'booking_b')?.status).toBe('declined');
    expect(updated.find((booking) => booking.id === 'booking_c')?.status).toBe('pending');
  });

  it('rejects status updates by non-owner', () => {
    writeJson(STORAGE_KEYS.bookings, [
      {
        id: 'booking_foreign_owner',
        itemId: 'item_1',
        renterId: currentUserId,
        ownerId: 'user_2',
        startDate: '2026-04-10',
        endDate: '2026-04-12',
        totalDays: 3,
        totalPrice: 90,
        status: 'pending',
        createdAt: '2026-03-23T10:00:00.000Z'
      }
    ]);

    expect(() => updateBookingStatus('booking_foreign_owner', 'approved')).toThrow(
      'Only owner can update status'
    );
  });
});

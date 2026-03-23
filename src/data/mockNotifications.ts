import type { Notification } from '../types/domain';

export const mockNotifications: Notification[] = [
  {
    id: 'note_seed_1',
    userId: 'user_1',
    type: 'system',
    message: 'Welcome to BorrowBox. Your dashboard is ready.',
    isRead: false,
    createdAt: '2026-03-20T09:00:00.000Z',
    link: '/dashboard'
  },
  {
    id: 'note_seed_2',
    userId: 'user_1',
    type: 'system',
    message: 'Tip: add complete descriptions to improve booking approval speed.',
    isRead: true,
    createdAt: '2026-03-18T12:00:00.000Z',
    link: '/add-listing'
  }
];

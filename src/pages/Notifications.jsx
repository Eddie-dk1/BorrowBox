import { useMemo, useState } from 'react';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from '../utils/store';

const filters = ['all', 'unread', 'booking', 'system'];

export default function Notifications() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [notifications, setNotifications] = useState(getNotifications());

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return notifications;
    if (activeFilter === 'unread') return notifications.filter((item) => !item.isRead);
    if (activeFilter === 'booking') return notifications.filter((item) => item.type.startsWith('booking'));
    return notifications.filter((item) => item.type === 'system');
  }, [notifications, activeFilter]);

  function onMarkAllRead() {
    markAllNotificationsRead();
    setNotifications(getNotifications());
  }

  function onMarkRead(notificationId) {
    markNotificationRead(notificationId);
    setNotifications(getNotifications());
  }

  return (
    <section className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-sm text-neutral-600">Track booking updates and platform messages.</p>
        </div>
        <button
          type="button"
          onClick={onMarkAllRead}
          className="rounded-xl border border-line bg-white px-3 py-2 text-sm hover:bg-line"
        >
          Mark all read
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              activeFilter === filter
                ? 'bg-warm text-white'
                : 'border border-line bg-white text-charcoal hover:bg-line'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center text-sm text-neutral-600">
          No notifications in this filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((notification) => (
            <article
              key={notification.id}
              className={`rounded-2xl border p-4 ${
                notification.isRead ? 'border-line bg-white' : 'border-warm/40 bg-rose-50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{notification.message}</p>
                  <p className="mt-1 text-xs text-neutral-600">
                    {new Date(notification.createdAt).toLocaleString()} · {notification.type}
                  </p>
                </div>
                {!notification.isRead ? (
                  <button
                    type="button"
                    onClick={() => onMarkRead(notification.id)}
                    className="rounded-lg border border-line bg-white px-2 py-1 text-xs hover:bg-line"
                  >
                    Mark read
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

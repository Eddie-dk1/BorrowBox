import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  getCurrentUser,
  getNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsRead
} from '../api/marketplaceApi';
import { clearSession } from '../utils/auth';
import type { Notification } from '../types/domain';

const links: Array<{ to: string; label: string }> = [
  { to: '/catalog', label: 'Catalog' },
  { to: '/add-listing', label: 'Add listing' },
  { to: '/favorites', label: 'Favorites' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/my-profile', label: 'My' }
];

export default function Header() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(getNotifications());
  const [unreadCount, setUnreadCount] = useState(getUnreadNotificationsCount());

  useEffect(() => {
    function refreshNotifications() {
      setNotifications(getNotifications());
      setUnreadCount(getUnreadNotificationsCount());
    }

    window.addEventListener('borrowbox:notifications-changed', refreshNotifications);
    return () => {
      window.removeEventListener('borrowbox:notifications-changed', refreshNotifications);
    };
  }, []);

  function onMarkAllRead() {
    markAllNotificationsRead();
    setNotifications(getNotifications());
    setUnreadCount(getUnreadNotificationsCount());
  }

  function onLogout() {
    clearSession();
    navigate('/auth', { replace: true });
  }

  return (
    <header className="border-b border-line bg-white/80 backdrop-blur">
      <div className="border-b border-line/80 bg-orange-50/70">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-2 text-xs text-neutral-700 sm:px-6">
          <p>Signed in as {currentUser.name}</p>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <NavLink to="/" className="text-xl font-semibold tracking-tight text-charcoal">
            BorrowBox
          </NavLink>
          <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-700">MVP</span>
        </div>
        <nav className="flex items-center gap-2 text-sm sm:gap-4 sm:text-base">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 transition ${
                  isActive ? 'bg-warm text-white' : 'text-charcoal hover:bg-line'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotificationsOpen((prev) => !prev)}
              className="relative rounded-full border border-line bg-white p-2 hover:bg-line"
              aria-label="Open notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 rounded-full bg-warm px-1.5 py-0.5 text-[10px] text-white">
                  {unreadCount}
                </span>
              ) : null}
            </button>
            {isNotificationsOpen ? (
              <div className="absolute right-0 top-11 z-20 w-80 rounded-xl border border-line bg-white p-3 shadow-lg">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium">Notifications</p>
                  <div className="flex items-center gap-3">
                    <NavLink
                      to="/notifications"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-xs text-neutral-600 hover:underline"
                    >
                      View all
                    </NavLink>
                    <button
                      type="button"
                      onClick={onMarkAllRead}
                      className="text-xs text-warm hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                </div>
                <div className="max-h-72 space-y-2 overflow-auto">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-neutral-600">No notifications yet.</p>
                  ) : (
                    notifications.slice(0, 8).map((notification) => (
                      <NavLink
                        key={notification.id}
                        to={notification.link || '/dashboard'}
                        onClick={() => setIsNotificationsOpen(false)}
                        className={`block rounded-lg border p-2 text-xs ${
                          notification.isRead
                            ? 'border-line bg-white text-neutral-700'
                            : 'border-warm/40 bg-rose-50 text-neutral-800'
                        }`}
                      >
                        <p>{notification.message}</p>
                        <p className="mt-1 text-[10px] text-neutral-500">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </NavLink>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full border border-line px-3 py-1.5 text-sm text-neutral-700 hover:bg-line"
          >
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
}

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBookings, getCurrentUser, getItems, getUsers, updateBookingStatus } from '../api/marketplaceApi';
import type { Booking, BookingStatus, Item, User } from '../types/domain';

export default function Dashboard() {
  const currentUserId = getCurrentUser().id;
  const [bookings, setBookings] = useState<Booking[]>(getBookings());
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
  const items = getItems();
  const users = getUsers();

  const itemMap = useMemo<Record<string, Item>>(
    () => Object.fromEntries(items.map((item) => [item.id, item])),
    [items]
  );
  const userMap = useMemo<Record<string, User>>(
    () => Object.fromEntries(users.map((user) => [user.id, user])),
    [users]
  );

  const incomingRequests = useMemo(
    () => bookings.filter((booking) => booking.ownerId === currentUserId),
    [bookings]
  );
  const sortedIncomingRequests = useMemo(() => {
    const priority = { pending: 0, approved: 1, declined: 2, cancelled: 3 };
    return [...incomingRequests].sort((a, b) => {
      const statusDiff = (priority[a.status] ?? 9) - (priority[b.status] ?? 9);
      if (statusDiff !== 0) return statusDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [incomingRequests]);
  const queueRequests = useMemo(
    () => sortedIncomingRequests.filter((booking) => booking.status === 'pending'),
    [sortedIncomingRequests]
  );
  const historyRequests = useMemo(
    () => sortedIncomingRequests.filter((booking) => booking.status !== 'pending'),
    [sortedIncomingRequests]
  );
  const recentActivity = useMemo(
    () =>
      [...bookings]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6),
    [bookings]
  );

  function onStatusChange(bookingId: string, status: BookingStatus) {
    updateBookingStatus(bookingId, status);
    setBookings(getBookings());
  }

  function statusClasses(status: BookingStatus) {
    if (status === 'approved') return 'bg-green-50 text-green-700';
    if (status === 'declined') return 'bg-red-50 text-red-700';
    if (status === 'cancelled') return 'bg-neutral-100 text-neutral-700';
    return 'bg-amber-50 text-amber-700';
  }

  function formatDateRange(startDate: string, endDate: string) {
    return `${startDate} to ${endDate}`;
  }

  function formatMoney(amount: number) {
    return `$${Number(amount || 0).toFixed(0)}`;
  }

  const pendingIncoming = incomingRequests.filter((booking) => booking.status === 'pending').length;
  const approvedIncoming = incomingRequests.filter((booking) => booking.status === 'approved');
  const estimatedRevenue = approvedIncoming.reduce((sum, booking) => sum + booking.totalPrice, 0);
  const resolvedIncoming = incomingRequests.filter((booking) =>
    ['approved', 'declined', 'cancelled'].includes(booking.status)
  );

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-neutral-600">Manage listings, monitor requests, and approve rentals.</p>
        </div>
        <Link to="/add-listing" className="rounded-xl bg-warm px-4 py-2 text-sm font-medium text-white w-fit">
          Add new listing
        </Link>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-xs uppercase text-neutral-500">Incoming total</p>
          <p className="text-2xl font-semibold">{incomingRequests.length}</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-xs uppercase text-neutral-500">Resolved</p>
          <p className="text-2xl font-semibold">{resolvedIncoming.length}</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-xs uppercase text-neutral-500">Incoming pending</p>
          <p className="text-2xl font-semibold">{pendingIncoming}</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-xs uppercase text-neutral-500">Approved revenue</p>
          <p className="text-2xl font-semibold">{formatMoney(estimatedRevenue)}</p>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.95fr)]">
        <div className="space-y-4">
          <section className="space-y-3 rounded-2xl border border-line bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Incoming requests</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('queue')}
                  className={`rounded-full px-3 py-1 text-xs ${
                    activeTab === 'queue' ? 'bg-warm text-white' : 'border border-line bg-white'
                  }`}
                >
                  Queue ({queueRequests.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className={`rounded-full px-3 py-1 text-xs ${
                    activeTab === 'history' ? 'bg-warm text-white' : 'border border-line bg-white'
                  }`}
                >
                  History ({historyRequests.length})
                </button>
              </div>
            </div>
            {(activeTab === 'queue' ? queueRequests : historyRequests).length === 0 ? (
              <p className="text-sm text-neutral-600">No incoming requests.</p>
            ) : null}
            {(activeTab === 'queue' ? queueRequests : historyRequests).map((booking) => (
              <div key={booking.id} className="rounded-xl border border-line p-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{itemMap[booking.itemId]?.title || booking.itemId}</p>
                    <p className="text-neutral-600">{formatDateRange(booking.startDate, booking.endDate)}</p>
                    <p className="text-neutral-600">
                      Renter:{' '}
                      <Link to={`/owner/${booking.renterId}`} className="text-warm hover:underline">
                        {userMap[booking.renterId]?.name || booking.renterId}
                      </Link>
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs ${statusClasses(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                <p className="mt-2 text-neutral-700">Request total: {formatMoney(booking.totalPrice)}</p>
                {activeTab === 'queue' && booking.status === 'pending' ? (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => onStatusChange(booking.id, 'approved')}
                      className="rounded-lg bg-green-600 px-3 py-1 text-white"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => onStatusChange(booking.id, 'declined')}
                      className="rounded-lg bg-neutral-700 px-3 py-1 text-white"
                    >
                      Decline
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl border border-line bg-white p-4">
            <h2 className="text-lg font-semibold">Operations checklist</h2>
            <ul className="mt-3 space-y-2 text-sm text-neutral-700">
              <li>Review pending incoming requests daily</li>
              <li>Keep listing photos and descriptions up to date</li>
              <li>Approve only non-overlapping requests with reliable renters</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-line bg-white p-4">
            <h2 className="text-lg font-semibold">Recent activity</h2>
            {recentActivity.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-600">No activity yet.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {recentActivity.map((booking) => (
                  <div key={booking.id} className="rounded-xl bg-neutral-50 p-3 text-sm">
                    <p className="font-medium">{itemMap[booking.itemId]?.title || booking.itemId}</p>
                    <p className="text-neutral-600">
                      {userMap[booking.renterId]?.name || booking.renterId} requested{' '}
                      {formatDateRange(booking.startDate, booking.endDate)}
                    </p>
                    <p className="mt-1">
                      <span className={`rounded-full px-2 py-1 text-xs ${statusClasses(booking.status)}`}>
                        {booking.status}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}

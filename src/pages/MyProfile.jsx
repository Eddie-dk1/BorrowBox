import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { currentUserId } from '../data/mockUsers';
import {
  getBookings,
  getCurrentUser,
  getFavorites,
  getItems,
  getOwnerPublicStats,
  getReviewsByOwnerId
} from '../api/marketplaceApi';

export default function MyProfile() {
  const currentUser = getCurrentUser();
  const items = getItems();
  const bookings = getBookings();
  const ownerStats = getOwnerPublicStats(currentUserId);
  const reviews = getReviewsByOwnerId(currentUserId);

  const myListings = useMemo(
    () => items.filter((item) => item.ownerId === currentUserId),
    [items]
  );
  const myFavorites = useMemo(() => {
    const favoriteIds = getFavorites(currentUserId);
    return items.filter((item) => favoriteIds.includes(item.id));
  }, [items]);

  const outgoingRequests = useMemo(
    () => bookings.filter((booking) => booking.renterId === currentUserId),
    [bookings]
  );

  return (
    <section className="mx-auto grid max-w-5xl gap-5 xl:grid-cols-[320px_1fr]">
      <aside className="space-y-4 rounded-2xl border border-line bg-white p-5 h-fit xl:sticky xl:top-6">
        <div className="h-16 w-16 rounded-full bg-rose-100 flex items-center justify-center text-xl font-semibold text-rose-700">
          {currentUser.name.slice(0, 1)}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{currentUser.name}</h1>
          <p className="text-sm text-neutral-600">{currentUser.city}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl bg-neutral-50 p-3">
            <p className="text-neutral-500">Listings</p>
            <p className="font-semibold">{myListings.length}</p>
          </div>
          <div className="rounded-xl bg-neutral-50 p-3">
            <p className="text-neutral-500">Favorites</p>
            <p className="font-semibold">{myFavorites.length}</p>
          </div>
          <div className="rounded-xl bg-neutral-50 p-3">
            <p className="text-neutral-500">Requests</p>
            <p className="font-semibold">{outgoingRequests.length}</p>
          </div>
          <div className="rounded-xl bg-neutral-50 p-3">
            <p className="text-neutral-500">Rating</p>
            <p className="font-semibold">
              {ownerStats.reviewCount ? ownerStats.avgRating.toFixed(1) : 'New'}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Link to="/dashboard" className="block rounded-xl border border-line px-3 py-2 text-sm hover:bg-line">
            Open Dashboard
          </Link>
          <Link to="/add-listing" className="block rounded-xl border border-line px-3 py-2 text-sm hover:bg-line">
            Add Listing
          </Link>
          <Link to="/notifications" className="block rounded-xl border border-line px-3 py-2 text-sm hover:bg-line">
            View Notifications
          </Link>
        </div>
      </aside>

      <div className="space-y-4">
        <section className="rounded-2xl border border-line bg-white p-4">
          <h2 className="text-lg font-semibold">Owner performance</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-4 text-sm">
            <div className="rounded-xl bg-neutral-50 p-3">
              <p className="text-neutral-500">Approved</p>
              <p className="font-semibold">{ownerStats.approvedCount}</p>
            </div>
            <div className="rounded-xl bg-neutral-50 p-3">
              <p className="text-neutral-500">Pending</p>
              <p className="font-semibold">{ownerStats.pendingCount}</p>
            </div>
            <div className="rounded-xl bg-neutral-50 p-3">
              <p className="text-neutral-500">Requests</p>
              <p className="font-semibold">{ownerStats.requestsReceived}</p>
            </div>
            <div className="rounded-xl bg-neutral-50 p-3">
              <p className="text-neutral-500">Revenue</p>
              <p className="font-semibold">${ownerStats.revenueApproved.toFixed(0)}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-4">
          <h2 className="text-lg font-semibold">My listings</h2>
          {myListings.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-600">No listings yet.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {myListings.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-line p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-neutral-600">${item.pricePerDay}/day</p>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/item/${item.id}`} className="rounded-lg border border-line px-2 py-1 hover:bg-line">
                      View
                    </Link>
                    <Link
                      to={`/edit-listing/${item.id}`}
                      className="rounded-lg bg-warm px-2 py-1 text-white"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-white p-4">
          <h2 className="text-lg font-semibold">Recent reviews</h2>
          {reviews.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-600">No reviews yet.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {reviews.slice(0, 4).map((review) => (
                <article key={review.id} className="rounded-xl border border-line p-3 text-sm">
                  <p className="font-medium">{'★'.repeat(review.rating)}</p>
                  <p className="mt-1 text-neutral-700">{review.comment}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

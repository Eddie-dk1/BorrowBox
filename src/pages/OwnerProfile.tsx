import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ItemCard from '../components/ItemCard';
import {
  getBookings,
  getFavorites,
  getItems,
  getOwnerPublicStats,
  getReviewsByOwnerId,
  getUserById,
  toggleFavorite
} from '../api/marketplaceApi';

const responseTimeByOwner: Record<string, string> = {
  user_1: '9 min',
  user_2: '12 min',
  user_3: '16 min'
};

export default function OwnerProfile() {
  const { ownerId } = useParams<{ ownerId: string }>();
  const owner = ownerId ? getUserById(ownerId) : undefined;
  const [favorites, setFavorites] = useState<string[]>(getFavorites());

  const ownerListings = useMemo(() => {
    if (!ownerId) return [];
    return getItems().filter((item) => item.ownerId === ownerId);
  }, [ownerId]);
  const ownerBookings = useMemo(() => {
    if (!ownerId) return [];
    return getBookings().filter((booking) => booking.ownerId === ownerId);
  }, [ownerId]);
  const reviews = useMemo(() => {
    if (!ownerId) return [];
    return getReviewsByOwnerId(ownerId);
  }, [ownerId]);
  const stats = useMemo(() => {
    if (!ownerId) {
      return {
        listingCount: 0,
        requestsReceived: 0,
        approvedCount: 0,
        pendingCount: 0,
        revenueApproved: 0,
        reviewCount: 0,
        avgRating: 0
      };
    }
    return getOwnerPublicStats(ownerId);
  }, [ownerId]);

  if (!owner) {
    return (
      <section className="space-y-4">
        <p>Owner not found.</p>
        <Link to="/catalog" className="text-warm">
          Back to catalog
        </Link>
      </section>
    );
  }

  const rating = stats.avgRating ? stats.avgRating.toFixed(1) : 'New';

  function handleToggleFavorite(itemId: string) {
    setFavorites(toggleFavorite(itemId));
  }

  return (
    <section className="mx-auto grid max-w-5xl gap-6 xl:grid-cols-[320px_1fr]">
      <aside className="space-y-4 rounded-2xl border border-line bg-white p-5 h-fit xl:sticky xl:top-6">
        <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center text-xl font-semibold text-orange-700">
          {owner.name.slice(0, 1)}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{owner.name}</h1>
          <p className="text-sm text-neutral-600">{owner.city}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl bg-neutral-50 p-3">
            <p className="text-neutral-500">Rating</p>
            <p className="font-semibold">{rating}/5</p>
          </div>
          <div className="rounded-xl bg-neutral-50 p-3">
            <p className="text-neutral-500">Response</p>
            <p className="font-semibold">{responseTimeByOwner[owner.id] || '15 min'}</p>
          </div>
          <div className="rounded-xl bg-neutral-50 p-3">
            <p className="text-neutral-500">Approved</p>
            <p className="font-semibold">{stats.approvedCount}</p>
          </div>
          <div className="rounded-xl bg-neutral-50 p-3">
            <p className="text-neutral-500">Pending</p>
            <p className="font-semibold">{stats.pendingCount}</p>
          </div>
        </div>
        <div className="rounded-xl border border-line p-3 text-sm">
          <p className="font-medium">Owner notes</p>
          <p className="mt-1 text-neutral-600">
            Replies quickly, confirms pickup windows clearly, and shares setup tips before handoff.
          </p>
        </div>
      </aside>

      <div className="space-y-5">
        <section className="rounded-2xl border border-line bg-white p-5">
          <h2 className="text-lg font-semibold">Performance overview</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-neutral-50 p-3">
              <p className="text-xs uppercase text-neutral-500">Active listings</p>
              <p className="text-xl font-semibold">{ownerListings.length}</p>
            </div>
            <div className="rounded-xl bg-neutral-50 p-3">
              <p className="text-xs uppercase text-neutral-500">Requests received</p>
              <p className="text-xl font-semibold">{ownerBookings.length}</p>
            </div>
            <div className="rounded-xl bg-neutral-50 p-3">
              <p className="text-xs uppercase text-neutral-500">Revenue (approved)</p>
              <p className="text-xl font-semibold">${stats.revenueApproved.toFixed(0)}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-5">
          <h2 className="text-lg font-semibold">Recent reviews</h2>
          {reviews.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-600">No reviews yet.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {reviews.slice(0, 3).map((review) => (
                <article key={review.id} className="rounded-xl border border-line p-3 text-sm">
                  <p className="font-medium">
                    {'★'.repeat(review.rating)}
                    <span className="ml-2 text-neutral-600">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </p>
                  <p className="mt-1 text-neutral-700">{review.comment}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Active listings</h2>
            <Link to="/catalog" className="text-sm text-warm">
              Browse all items
            </Link>
          </div>
          {ownerListings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center text-sm text-neutral-600">
              This owner has no active listings.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {ownerListings.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  isFavorite={favorites.includes(item.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

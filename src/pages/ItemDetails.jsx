import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BookingBox from '../components/BookingBox';
import ItemCard from '../components/ItemCard';
import {
  getBookings,
  getFavorites,
  getItemById,
  getItems,
  getOwnerPublicStats,
  toggleFavorite
} from '../utils/store';

const fallbackImage =
  'https://placehold.co/1200x800/f2efe8/1f1f1d?text=BorrowBox+Item';

export default function ItemDetails() {
  const { itemId } = useParams();
  const item = getItemById(itemId);
  const [favorites, setFavorites] = useState(getFavorites());
  const ownerStats = useMemo(
    () => (item ? getOwnerPublicStats(item.ownerId) : null),
    [item]
  );
  const similarItems = useMemo(() => {
    if (!item) return [];
    return getItems()
      .filter((entry) => entry.id !== item.id && entry.category === item.category)
      .slice(0, 3);
  }, [item]);
  const blockedRanges = useMemo(() => {
    if (!item) return [];
    return getBookings()
      .filter(
        (booking) =>
          booking.itemId === item.id && ['pending', 'approved'].includes(booking.status)
      )
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }, [item]);

  function handleToggleFavorite(targetItemId) {
    setFavorites(toggleFavorite(targetItemId));
  }

  if (!item) {
    return (
      <section className="space-y-4">
        <p>Item not found.</p>
        <Link to="/catalog" className="text-warm">
          Back to catalog
        </Link>
      </section>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <article className="space-y-4">
        <img
          src={item.image}
          alt={item.title}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = fallbackImage;
          }}
          className="h-72 w-full rounded-2xl object-cover"
        />
        <div>
          <h1 className="text-2xl font-semibold">{item.title}</h1>
          <p className="text-sm text-neutral-600">{item.city} · {item.condition}</p>
        </div>
        <p className="text-neutral-700">{item.description}</p>
        <div className="grid gap-2 rounded-2xl border border-line bg-white p-4 text-sm sm:grid-cols-2">
          <p>
            <span className="font-medium">Category:</span> {item.category}
          </p>
          <p>
            <span className="font-medium">Owner:</span>{' '}
            <Link to={`/owner/${item.ownerId}`} className="text-warm hover:underline">
              {item.ownerName}
            </Link>
          </p>
          <p>
            <span className="font-medium">Deposit:</span> ${item.deposit || 0}
          </p>
          <p>
            <span className="font-medium">Status:</span> available
          </p>
          <p>
            <span className="font-medium">Owner rating:</span>{' '}
            {ownerStats?.reviewCount ? `${ownerStats.avgRating.toFixed(1)} (${ownerStats.reviewCount} reviews)` : 'New owner'}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4">
          <h2 className="text-lg font-semibold">What is included</h2>
          <ul className="mt-3 space-y-2 text-sm text-neutral-700">
            <li>Original accessories for this item</li>
            <li>Basic setup guidance from the owner</li>
            <li>Pickup details shared after approval</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4">
          <h2 className="text-lg font-semibold">Rental terms</h2>
          <ul className="mt-3 space-y-2 text-sm text-neutral-700">
            <li>Valid ID required at handoff</li>
            <li>Late return fee: 1 day rental price per day</li>
            <li>Damage is reviewed with owner on return</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4">
          <h2 className="text-lg font-semibold">Availability</h2>
          {blockedRanges.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-700">No blocked dates right now.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {blockedRanges.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-xl border border-line p-3 text-sm"
                >
                  <p>
                    {booking.startDate} to {booking.endDate}
                  </p>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      booking.status === 'approved'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        {similarItems.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Similar items</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {similarItems.map((similar) => (
                <ItemCard
                  key={similar.id}
                  item={similar}
                  isFavorite={favorites.includes(similar.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          </section>
        ) : null}
      </article>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <BookingBox item={item} />
      </div>
    </section>
  );
}

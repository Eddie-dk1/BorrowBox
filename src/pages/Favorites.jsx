import { useMemo, useState } from 'react';
import ItemCard from '../components/ItemCard';
import { getFavorites, getItems, toggleFavorite } from '../utils/store';

export default function Favorites() {
  const [favoriteIds, setFavoriteIds] = useState(getFavorites());
  const items = getItems();

  const favoriteItems = useMemo(
    () => items.filter((item) => favoriteIds.includes(item.id)),
    [items, favoriteIds]
  );

  function handleToggleFavorite(itemId) {
    setFavoriteIds(toggleFavorite(itemId));
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Favorites</h1>
      {favoriteItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center">
          <p className="font-medium">No favorites yet</p>
          <p className="mt-1 text-sm text-neutral-600">
            Save items from home or catalog and they will appear here.
          </p>
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {favoriteItems.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            isFavorite={favoriteIds.includes(item.id)}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </div>
    </section>
  );
}

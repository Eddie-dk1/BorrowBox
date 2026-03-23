import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Filters from '../components/Filters';
import ItemCard from '../components/ItemCard';
import SearchBar from '../components/SearchBar';
import { getFavorites, getItems, toggleFavorite } from '../api/marketplaceApi';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [favorites, setFavorites] = useState(getFavorites());

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'All',
    city: searchParams.get('city') || '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest'
  });

  const q = searchParams.get('q') || '';
  const items = getItems();

  const filtered = useMemo(() => {
    const base = items.filter((item) => {
      const qMatch =
        !q ||
        item.title.toLowerCase().includes(q.toLowerCase()) ||
        item.description.toLowerCase().includes(q.toLowerCase());
      const categoryMatch = filters.category === 'All' || item.category === filters.category;
      const cityMatch = !filters.city || item.city.toLowerCase().includes(filters.city.toLowerCase());
      const minMatch = !filters.minPrice || item.pricePerDay >= Number(filters.minPrice);
      const maxMatch = !filters.maxPrice || item.pricePerDay <= Number(filters.maxPrice);

      return qMatch && categoryMatch && cityMatch && minMatch && maxMatch;
    });

    return base.sort((a, b) => {
      if (filters.sort === 'cheapest') return a.pricePerDay - b.pricePerDay;
      if (filters.sort === 'expensive') return b.pricePerDay - a.pricePerDay;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [items, q, filters]);

  function handleSearch(form) {
    const params = new URLSearchParams();
    if (form.q) params.set('q', form.q);
    if (form.category && form.category !== 'All') params.set('category', form.category);
    if (form.city) params.set('city', form.city);
    setSearchParams(params);
    setFilters((prev) => ({ ...prev, category: form.category, city: form.city }));
  }

  function handleToggleFavorite(itemId) {
    setFavorites(toggleFavorite(itemId));
  }

  const activeFilterTags = [
    q ? `Search: ${q}` : null,
    filters.category !== 'All' ? `Category: ${filters.category}` : null,
    filters.city ? `City: ${filters.city}` : null,
    filters.minPrice ? `Min: $${filters.minPrice}` : null,
    filters.maxPrice ? `Max: $${filters.maxPrice}` : null
  ].filter(Boolean);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Catalog</h1>
      <SearchBar
        onSearch={handleSearch}
        initialValues={{ q, category: filters.category, city: filters.city, startDate: '', endDate: '' }}
      />
      <Filters values={filters} onChange={setFilters} />

      <p className="text-sm text-neutral-600">{filtered.length} items found</p>
      {activeFilterTags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {activeFilterTags.map((tag) => (
            <span key={tag} className="rounded-full border border-line bg-white px-3 py-1 text-xs">
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center">
          <p className="font-medium">No items matched your filters</p>
          <p className="mt-1 text-sm text-neutral-600">Try clearing city or price range.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
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
  );
}

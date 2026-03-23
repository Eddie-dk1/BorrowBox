import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ItemCard from '../components/ItemCard';
import SearchBar from '../components/SearchBar';
import type { SearchFormValues } from '../components/SearchBar';
import { getFavorites, getItems, toggleFavorite } from '../api/marketplaceApi';

const chips = ['Cameras', 'Gaming', 'Audio', 'Laptops', 'Projectors'];
const trustStats = [
  { label: 'Active listings', value: '120+' },
  { label: 'Cities covered', value: '18' },
  { label: 'Avg owner response', value: '11 min' }
];
const testimonials = [
  {
    name: 'Maksim',
    quote: 'I rented a camera for a weekend shoot in 5 minutes. Super smooth.',
    role: 'Renter'
  },
  {
    name: 'Nina',
    quote: 'My PS5 gets booked almost every week. It became a side income stream.',
    role: 'Owner'
  }
];

export default function Home() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<string[]>(getFavorites());
  const [items] = useState(getItems);

  const featured = useMemo(() => items.slice(0, 6), [items]);

  function handleSearch(form: SearchFormValues) {
    const params = new URLSearchParams();
    if (form.q) params.set('q', form.q);
    if (form.category && form.category !== 'All') params.set('category', form.category);
    if (form.city) params.set('city', form.city);
    navigate(`/catalog?${params.toString()}`);
  }

  function handleChip(category: string) {
    navigate(`/catalog?category=${encodeURIComponent(category)}`);
  }

  function handleToggleFavorite(itemId: string) {
    setFavorites(toggleFavorite(itemId));
  }

  return (
    <section className="space-y-8">
      <div className="space-y-5 rounded-2xl bg-gradient-to-r from-white to-orange-50 p-6">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Rent what you need, when you need it
        </h1>
        <p className="max-w-2xl text-neutral-700">
          Cameras, gaming, audio and more from people near you. No long-term commitments, just
          fast local access.
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {trustStats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-line bg-white p-3">
              <p className="text-xs uppercase text-neutral-500">{stat.label}</p>
              <p className="text-lg font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <SearchBar onSearch={handleSearch} />

      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => handleChip(chip)}
            className="rounded-full border border-line bg-white px-3 py-1.5 text-sm hover:bg-line"
          >
            {chip}
          </button>
        ))}
      </div>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Featured items</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              isFavorite={favorites.includes(item.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-3 rounded-2xl border border-line bg-white p-5 sm:grid-cols-3">
        <div>
          <p className="text-sm uppercase text-neutral-500">Step 1</p>
          <p className="font-medium">Find an item</p>
        </div>
        <div>
          <p className="text-sm uppercase text-neutral-500">Step 2</p>
          <p className="font-medium">Choose dates</p>
        </div>
        <div>
          <p className="text-sm uppercase text-neutral-500">Step 3</p>
          <p className="font-medium">Send request</p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {testimonials.map((item) => (
          <article key={item.name} className="rounded-2xl border border-line bg-white p-5">
            <p className="text-sm text-neutral-700">“{item.quote}”</p>
            <p className="mt-3 text-sm font-medium">
              {item.name} · <span className="text-neutral-600">{item.role}</span>
            </p>
          </article>
        ))}
      </section>
    </section>
  );
}

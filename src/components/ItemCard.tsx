import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Item } from '../types/domain';

const fallbackImage =
  'https://placehold.co/1200x800/f2efe8/1f1f1d?text=BorrowBox+Item';

interface ItemCardProps {
  item: Item;
  isFavorite: boolean;
  onToggleFavorite: (itemId: string) => void;
}

export default function ItemCard({ item, isFavorite, onToggleFavorite }: ItemCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative">
        <img
          src={item.image}
          alt={item.title}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = fallbackImage;
          }}
          className="h-44 w-full object-cover"
        />
        <button
          type="button"
          aria-label="Toggle favorite"
          onClick={() => onToggleFavorite(item.id)}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2"
        >
          <Heart size={18} className={isFavorite ? 'fill-warm text-warm' : 'text-charcoal'} />
        </button>
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between text-sm text-neutral-600">
          <span>{item.city}</span>
          <span className="rounded-full bg-green-50 px-2 py-1 text-xs text-green-700">Available</span>
        </div>
        <h3 className="line-clamp-1 text-base font-semibold">{item.title}</h3>
        <p className="text-sm text-neutral-600">${item.pricePerDay} / day</p>
        <Link to={`/item/${item.id}`} className="inline-block text-sm font-medium text-warm">
          Open details
        </Link>
      </div>
    </article>
  );
}

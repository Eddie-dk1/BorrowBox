import type { ChangeEvent } from 'react';

export interface FilterValues {
  category: string;
  city: string;
  minPrice: string;
  maxPrice: string;
  sort: 'newest' | 'cheapest' | 'expensive' | string;
}

interface FiltersProps {
  values: FilterValues;
  onChange: (values: FilterValues) => void;
}

export default function Filters({ values, onChange }: FiltersProps) {
  function update(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    onChange({ ...values, [event.target.name]: event.target.value });
  }

  return (
    <section className="grid gap-2 rounded-2xl border border-line bg-white p-4 md:grid-cols-5">
      <select
        name="category"
        value={values.category}
        onChange={update}
        className="rounded-xl border border-line px-3 py-2"
      >
        <option value="All">All categories</option>
        <option value="Cameras">Cameras</option>
        <option value="Gaming">Gaming</option>
        <option value="Audio">Audio</option>
        <option value="Laptops">Laptops</option>
        <option value="Projectors">Projectors</option>
        <option value="Other">Other</option>
      </select>
      <input
        name="city"
        value={values.city}
        onChange={update}
        placeholder="City"
        className="rounded-xl border border-line px-3 py-2"
      />
      <input
        type="number"
        name="minPrice"
        value={values.minPrice}
        onChange={update}
        placeholder="Min price"
        className="rounded-xl border border-line px-3 py-2"
      />
      <input
        type="number"
        name="maxPrice"
        value={values.maxPrice}
        onChange={update}
        placeholder="Max price"
        className="rounded-xl border border-line px-3 py-2"
      />
      <select
        name="sort"
        value={values.sort}
        onChange={update}
        className="rounded-xl border border-line px-3 py-2"
      >
        <option value="newest">Newest</option>
        <option value="cheapest">Cheapest</option>
        <option value="expensive">Most expensive</option>
      </select>
    </section>
  );
}

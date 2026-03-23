import { useState, type ChangeEvent, type FormEvent } from 'react';

export interface SearchFormValues {
  q: string;
  category: string;
  city: string;
  startDate: string;
  endDate: string;
}

interface SearchBarProps {
  initialValues?: SearchFormValues;
  onSearch: (values: SearchFormValues) => void;
  showDates?: boolean;
}

export default function SearchBar({ initialValues, onSearch, showDates = false }: SearchBarProps) {
  const [form, setForm] = useState(
    initialValues || { q: '', category: 'All', city: '', startDate: '', endDate: '' }
  );

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(form);
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-2 rounded-2xl border border-line bg-white p-4 shadow-sm md:grid-cols-5"
    >
      <input
        name="q"
        placeholder="What do you need?"
        value={form.q}
        onChange={handleChange}
        className="rounded-xl border border-line px-3 py-2"
      />
      <select
        name="category"
        value={form.category}
        onChange={handleChange}
        className="rounded-xl border border-line px-3 py-2"
      >
        <option>All</option>
        <option>Cameras</option>
        <option>Gaming</option>
        <option>Audio</option>
        <option>Laptops</option>
        <option>Projectors</option>
        <option>Other</option>
      </select>
      <input
        name="city"
        placeholder="City"
        value={form.city}
        onChange={handleChange}
        className="rounded-xl border border-line px-3 py-2"
      />
      {showDates ? (
        <div className="grid grid-cols-2 gap-2 md:col-span-1">
          <input
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            className="rounded-xl border border-line px-2 py-2 text-sm"
          />
          <input
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={handleChange}
            className="rounded-xl border border-line px-2 py-2 text-sm"
          />
        </div>
      ) : (
        <div />
      )}
      <button type="submit" className="rounded-xl bg-warm px-4 py-2 font-medium text-white">
        Search
      </button>
    </form>
  );
}

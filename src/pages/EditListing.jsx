import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getItemById, updateItem } from '../api/marketplaceApi';

const emptyForm = {
  title: '',
  category: 'Cameras',
  pricePerDay: '',
  city: '',
  condition: 'good',
  description: '',
  image: '',
  deposit: ''
};

export default function EditListing() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');

  useEffect(() => {
    const item = getItemById(itemId);
    if (!item) {
      setError('Listing not found');
      return;
    }

    setForm({
      title: item.title,
      category: item.category,
      pricePerDay: String(item.pricePerDay),
      city: item.city,
      condition: item.condition,
      description: item.description,
      image: item.image,
      deposit: item.deposit ? String(item.deposit) : ''
    });
  }, [itemId]);

  function update(event) {
    if (event.target.name === 'image') {
      setSelectedFileName('');
    }
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read selected file'));
      reader.readAsDataURL(file);
    });
  }

  async function onImageFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      setForm((prev) => ({ ...prev, image: dataUrl }));
      setSelectedFileName(file.name);
      setError('');
    } catch (err) {
      setError(err.message || 'Could not upload this image');
    }
  }

  function submit(event) {
    event.preventDefault();
    setError('');

    if (!form.title || !form.pricePerDay || !form.city || !form.description || !form.image) {
      setError('Please fill all required fields');
      return;
    }

    try {
      const updated = updateItem(itemId, form);
      navigate(`/item/${updated.id}`);
    } catch (err) {
      setError(err.message || 'Failed to update listing');
    }
  }

  if (error === 'Listing not found') {
    return (
      <section className="space-y-4">
        <p>{error}</p>
        <Link to="/my-profile" className="text-warm hover:underline">
          Back to profile
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Edit listing</h1>
      <form onSubmit={submit} className="space-y-3 rounded-2xl border border-line bg-white p-5">
        <input name="title" value={form.title} onChange={update} placeholder="Title" className="w-full rounded-xl border border-line px-3 py-2" />
        <div className="grid gap-2 sm:grid-cols-2">
          <select name="category" value={form.category} onChange={update} className="rounded-xl border border-line px-3 py-2">
            <option>Cameras</option>
            <option>Gaming</option>
            <option>Audio</option>
            <option>Laptops</option>
            <option>Projectors</option>
            <option>Other</option>
          </select>
          <input name="pricePerDay" type="number" value={form.pricePerDay} onChange={update} placeholder="Price per day" className="rounded-xl border border-line px-3 py-2" />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <input name="city" value={form.city} onChange={update} placeholder="City" className="rounded-xl border border-line px-3 py-2" />
          <select name="condition" value={form.condition} onChange={update} className="rounded-xl border border-line px-3 py-2">
            <option value="new">new</option>
            <option value="good">good</option>
            <option value="used">used</option>
          </select>
        </div>

        <div className="space-y-2 rounded-xl border border-line p-3">
          <p className="text-sm font-medium">Photo</p>
          <input
            type="file"
            accept="image/*"
            onChange={onImageFileChange}
            className="w-full rounded-xl border border-line px-3 py-2 text-sm"
          />
          {selectedFileName ? (
            <p className="text-xs text-neutral-600">Selected file: {selectedFileName}</p>
          ) : null}
          <p className="text-xs text-neutral-500">Or paste an image URL below</p>
          <input
            name="image"
            value={form.image.startsWith('data:') ? '' : form.image}
            onChange={update}
            placeholder="Image URL"
            className="w-full rounded-xl border border-line px-3 py-2"
          />
        </div>

        <input name="deposit" type="number" value={form.deposit} onChange={update} placeholder="Deposit (optional)" className="w-full rounded-xl border border-line px-3 py-2" />
        <textarea name="description" value={form.description} onChange={update} placeholder="Description" rows={4} className="w-full rounded-xl border border-line px-3 py-2" />
        <div className="flex gap-2">
          <button type="submit" className="rounded-xl bg-warm px-4 py-2 font-medium text-white">
            Save changes
          </button>
          <Link to="/my-profile" className="rounded-xl border border-line px-4 py-2 text-sm">
            Cancel
          </Link>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>

      {form.image ? (
        <section className="rounded-2xl border border-line bg-white p-4">
          <p className="mb-2 text-sm font-medium">Image preview</p>
          <img
            src={form.image}
            alt="Listing preview"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = 'https://placehold.co/1200x800/f2efe8/1f1f1d?text=Image+Unavailable';
            }}
            className="h-56 w-full rounded-xl object-cover"
          />
        </section>
      ) : null}
    </section>
  );
}

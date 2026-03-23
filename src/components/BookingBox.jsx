import { useMemo, useState } from 'react';
import { createBooking, getActiveBookingsForItem, hasBookingConflict } from '../utils/store';
import { calculateTotalPrice } from '../utils/price';
import { diffCalendarDaysInclusive } from '../utils/date';

export default function BookingBox({ item }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [bookingsVersion, setBookingsVersion] = useState(0);
  const activeBookings = useMemo(
    () => getActiveBookingsForItem(item.id),
    [item.id, bookingsVersion]
  );

  const totalDays = useMemo(() => {
    if (!startDate || !endDate || endDate < startDate) return 0;
    return diffCalendarDaysInclusive(startDate, endDate);
  }, [startDate, endDate]);

  const totalPrice = useMemo(() => {
    if (!totalDays) return 0;
    return calculateTotalPrice(totalDays, item.pricePerDay);
  }, [totalDays, item.pricePerDay]);

  const liveConflict = useMemo(() => {
    if (!startDate || !endDate || endDate < startDate) return false;
    return hasBookingConflict(item.id, startDate, endDate);
  }, [item.id, startDate, endDate]);

  const isInvalidRange = !!startDate && !!endDate && endDate < startDate;
  const canSubmit = !!startDate && !!endDate && !isInvalidRange && !liveConflict;

  function submit(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      createBooking({ itemId: item.id, startDate, endDate });
      setMessage('Request sent. Owner will review it.');
      setBookingsVersion((value) => value + 1);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <aside className="space-y-3 rounded-2xl border border-line bg-white p-4 shadow-sm">
      <p className="text-xl font-semibold">${item.pricePerDay} / day</p>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="rounded-xl border border-line px-2 py-2 text-sm"
          />
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="rounded-xl border border-line px-2 py-2 text-sm"
          />
        </div>
        <div className="rounded-xl bg-neutral-50 p-3 text-sm text-neutral-700">
          <p>{totalDays || 0} days</p>
          <p className="font-medium">Total: ${totalPrice}</p>
        </div>
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-xl bg-warm px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send request
        </button>
      </form>
      {isInvalidRange ? (
        <p className="text-sm text-red-600">End date must be the same day or after start date.</p>
      ) : null}
      {liveConflict ? (
        <p className="text-sm text-red-600">These dates are unavailable. Choose another range.</p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-green-700">{message}</p> : null}
      {activeBookings.length > 0 ? (
        <div className="rounded-xl border border-line p-3">
          <p className="text-xs font-medium uppercase text-neutral-500">Booked or pending ranges</p>
          <div className="mt-2 space-y-1 text-xs text-neutral-700">
            {activeBookings.slice(0, 4).map((booking) => (
              <p key={booking.id}>
                {booking.startDate} to {booking.endDate} · {booking.status}
              </p>
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  );
}

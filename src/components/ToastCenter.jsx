import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ToastCenter() {
  const navigate = useNavigate();
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    function onToast(event) {
      const payload = event.detail;
      if (!payload?.id) return;
      setToasts((prev) => [payload, ...prev].slice(0, 4));

      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== payload.id));
      }, 4000);
    }

    window.addEventListener('borrowbox:toast', onToast);
    return () => {
      window.removeEventListener('borrowbox:toast', onToast);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-20 z-50 space-y-2 w-[min(22rem,90vw)]">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => navigate(toast.link || '/notifications')}
          className="w-full rounded-xl border border-line bg-white p-3 text-left shadow-lg hover:bg-neutral-50"
        >
          <p className="text-xs uppercase text-neutral-500">New update</p>
          <p className="mt-1 text-sm font-medium text-charcoal">{toast.message}</p>
        </button>
      ))}
    </div>
  );
}

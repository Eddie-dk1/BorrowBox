import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import ToastCenter from './components/ToastCenter';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ItemDetails from './pages/ItemDetails';
import AddListing from './pages/AddListing';
import Favorites from './pages/Favorites';
import Dashboard from './pages/Dashboard';
import OwnerProfile from './pages/OwnerProfile';
import Notifications from './pages/Notifications';
import MyProfile from './pages/MyProfile';
import EditListing from './pages/EditListing';
import Auth from './pages/Auth';
import { initializeStore } from './api/marketplaceApi';
import { isAuthenticated } from './utils/auth';

initializeStore();

export default function App() {
  const [authVersion, setAuthVersion] = useState(0);

  useEffect(() => {
    function onAuthChanged() {
      setAuthVersion((value) => value + 1);
    }

    window.addEventListener('borrowbox:auth-changed', onAuthChanged);
    return () => {
      window.removeEventListener('borrowbox:auth-changed', onAuthChanged);
    };
  }, []);

  const authenticated = isAuthenticated();

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-cream text-charcoal" key={`auth-${authVersion}`}>
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream text-charcoal" key={`app-${authVersion}`}>
      <Header />
      <ToastCenter />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <Routes>
          <Route path="/auth" element={<Navigate to="/" replace />} />
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/item/:itemId" element={<ItemDetails />} />
          <Route path="/add-listing" element={<AddListing />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/edit-listing/:itemId" element={<EditListing />} />
          <Route path="/owner/:ownerId" element={<OwnerProfile />} />
        </Routes>
      </main>
      <footer className="mt-10 border-t border-line bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>BorrowBox · Peer-to-peer rentals for tech and everyday gear</p>
          <p>Mock data mode · Payments and verification coming next</p>
        </div>
      </footer>
    </div>
  );
}

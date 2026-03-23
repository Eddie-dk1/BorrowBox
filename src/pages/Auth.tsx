import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { addUser, authenticateUser } from '../api/marketplaceApi';
import { setSessionUserId } from '../utils/auth';

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin');
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupCity, setSignupCity] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [error, setError] = useState('');

  function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    try {
      const user = authenticateUser(signinEmail, signinPassword);
      setSessionUserId(user.id);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }

  function signUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    try {
      const user = addUser({
        name: signupName,
        city: signupCity,
        email: signupEmail,
        password: signupPassword
      });
      setSessionUserId(user.id);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    }
  }

  return (
    <section className="mx-auto max-w-5xl py-8 sm:py-16">
      <div className="grid gap-6 rounded-3xl border border-line bg-white p-4 shadow-sm sm:grid-cols-2 sm:p-8">
        <div className="rounded-2xl bg-rose-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">BorrowBox</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-charcoal">
            Rent smarter with trusted local owners
          </h1>
          <p className="mt-3 text-sm text-neutral-700">
            Sign in to browse listings, send booking requests, manage your dashboard, and track notifications.
          </p>
        </div>

        <div className="space-y-4 rounded-2xl border border-line p-5 sm:p-6">
          <div className="grid grid-cols-2 rounded-xl bg-neutral-100 p-1">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                mode === 'signin' ? 'bg-white text-charcoal shadow-sm' : 'text-neutral-600'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                mode === 'signup' ? 'bg-white text-charcoal shadow-sm' : 'text-neutral-600'
              }`}
            >
              Sign up
            </button>
          </div>

          {mode === 'signin' ? (
            <form onSubmit={signIn} className="space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block text-neutral-700">Email</span>
                <input
                  type="email"
                  value={signinEmail}
                  onChange={(event) => setSigninEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-line px-3 py-2 outline-none focus:border-warm"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-neutral-700">Password</span>
                <input
                  type="password"
                  value={signinPassword}
                  onChange={(event) => setSigninPassword(event.target.value)}
                  placeholder="Your password"
                  className="w-full rounded-xl border border-line px-3 py-2 outline-none focus:border-warm"
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-xl bg-warm px-4 py-2 font-medium text-white hover:opacity-90"
              >
                Log in
              </button>
              <p className="text-xs text-neutral-500">
                Demo login: <span className="font-medium">eddie@borrowbox.local</span> /{' '}
                <span className="font-medium">demo12345</span>
              </p>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </form>
          ) : (
            <form onSubmit={signUp} className="space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block text-neutral-700">Name</span>
                <input
                  type="text"
                  value={signupName}
                  onChange={(event) => setSignupName(event.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-line px-3 py-2 outline-none focus:border-warm"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-neutral-700">City</span>
                <input
                  type="text"
                  value={signupCity}
                  onChange={(event) => setSignupCity(event.target.value)}
                  placeholder="Any city"
                  className="w-full rounded-xl border border-line px-3 py-2 outline-none focus:border-warm"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-neutral-700">Email</span>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(event) => setSignupEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-line px-3 py-2 outline-none focus:border-warm"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-neutral-700">Password</span>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(event) => setSignupPassword(event.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-line px-3 py-2 outline-none focus:border-warm"
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-xl bg-warm px-4 py-2 font-medium text-white hover:opacity-90"
              >
                Create account
              </button>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

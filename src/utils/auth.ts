const SESSION_KEY = 'borrowbox_session_user_id';

function emitAuthChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('borrowbox:auth-changed'));
  }
}

export function getSessionUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_KEY);
}

export function setSessionUserId(userId: string): void {
  localStorage.setItem(SESSION_KEY, userId);
  emitAuthChanged();
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  emitAuthChanged();
}

export function isAuthenticated(): boolean {
  return Boolean(getSessionUserId());
}

const GUEST_PATHS = new Set(['/login', '/register', '/forgot-password', '/oauth/google/callback']);

/** Возвращает безопасный внутренний адрес после авторизации. */
export function getAuthRedirect(search: string): string {
  const destination = new URLSearchParams(search).get('redirectTo');
  if (!destination || !destination.startsWith('/') || destination.startsWith('//')) {
    return '/';
  }
  const target = new URL(destination, window.location.origin);
  if (target.origin !== window.location.origin || GUEST_PATHS.has(target.pathname)) {
    return '/';
  }
  return `${target.pathname}${target.search}${target.hash}`;
}

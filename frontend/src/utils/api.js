/**
 * Resolves the backend API base URL cleanly across environments:
 * - Uses VITE_API_URL if explicitly configured.
 * - Uses http://localhost:5000 during local development.
 * - Uses same-origin relative /api paths in production (routed via vercel.json).
 */
export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return 'http://localhost:5000';
  }
  return '';
};


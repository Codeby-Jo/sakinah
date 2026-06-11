/**
 * Authenticated API helpers
 * Connects to the FastAPI backend at http://localhost:8000
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

/** Token Management */
export function getToken(): string | null {
  return localStorage.getItem('sakinah_token');
}

export function setToken(token: string): void {
  localStorage.setItem('sakinah_token', token);
}

export function getUserId(): string | null {
  return localStorage.getItem('sakinah_user_id');
}

export function setUserId(id: string): void {
  localStorage.setItem('sakinah_user_id', id);
}

export function clearToken(): void {
  localStorage.removeItem('sakinah_token');
  localStorage.removeItem('sakinah_user_id');
}

/** Build headers with Authorization token */
async function authHeaders(extra?: Record<string, string>): Promise<Record<string, string>> {
  const headers: Record<string, string> = { ...extra };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/** Authenticated POST request. */
export async function authPost<T>(path: string, body: unknown): Promise<T> {
  const headers = await authHeaders({ 'Content-Type': 'application/json' });
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${err}`);
  }
  return res.json();
}

/** Form Data POST (for login) */
export async function authPostForm<T>(path: string, body: Record<string, string>): Promise<T> {
  const headers = await authHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
  const params = new URLSearchParams();
  for (const key in body) {
    params.append(key, body[key]);
  }
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: 'POST',
    headers,
    body: params.toString(),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${err}`);
  }
  return res.json();
}

/** Authenticated GET request. */
export async function authGet<T>(path: string): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: 'GET',
    headers,
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${err}`);
  }
  return res.json();
}

/** Authenticated multipart/form-data POST (for KYC) */
export async function authPostMultipart<T>(path: string, form: FormData): Promise<T> {
  const headers = await authHeaders();
  // Don't set Content-Type explicitly for FormData — browser must supply boundary
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: 'POST',
    headers,
    body: form,
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${err}`);
  }
  return res.json();
}

import { redirect } from 'next/navigation';
import { getToken } from './session';
import type { Role, Scan, ScanInput, User } from './types';
export const API_URL = process.env.API_URL ?? 'http://localhost:8000';
export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
async function send(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getToken();
  const res = await fetch(`${API_URL}${path}`, {
    cache: 'no-store', ...init,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers },
  });
  if (res.status === 401) redirect('/login');
  return res;
}
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await send(path, {
    ...init, headers: { 'Content-Type': 'application/json', ...init.headers },
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return (res.status === 204 ? undefined : await res.json()) as T;
}
export const api = {
  list(q?: string, grade?: string, page = 1, pageSize = 20) {
    const params = new URLSearchParams({ limit: String(pageSize), offset: String((page - 1) * pageSize) });
    if (q) params.set('q', q);
    if (grade !== undefined && grade !== '') params.set('grade', grade);
    return request<Scan[]>(`/scans?${params}`);
  },
  async get(id: number): Promise<Scan | null> {
    const res = await send(`/scans/${id}`);
    if (res.status === 404 || res.status === 422) return null;
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.json();
  },
  create(data: ScanInput) {
    return request<Scan>('/scans', { method: 'POST', body: JSON.stringify(data) });
  },
  async upload(file: File): Promise<Scan> {
    const body = new FormData();
    body.append('file', file, file.name);
    const res = await send('/scans/upload', { method: 'POST', body });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.json();
  },
  update(id: number, data: Partial<ScanInput>) {
    return request<Scan>(`/scans/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  remove(id: number) { return request<void>(`/scans/${id}`, { method: 'DELETE' }); },
  users() { return request<User[]>('/users'); },
  setRole(id: number, role: Role) {
    return request<User>(`/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });
  },
};
export const auth = {
  async login(email: string, password: string): Promise<string | null> {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username: email, password }), cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()).access_token;
  },
  async register(email: string, fullName: string, password: string): Promise<number> {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, full_name: fullName, password }), cache: 'no-store',
    });
    return res.status;
  },
};

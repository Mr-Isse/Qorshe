import { colors } from '../constants/theme';
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> { const response = await fetch(`${API_URL}${path}`, { headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) }, ...init }); if (!response.ok) throw new Error(`API request failed with status ${response.status}`); return response.json() as Promise<T>; }
export { colors };

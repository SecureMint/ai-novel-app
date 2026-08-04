import { type Book } from "../types";

export type CategorySection = {
  key: "hot" | "subject" | "role" | "plot";
  title: "热门标签" | "主题" | "角色" | "情节";
  tags: string[];
};

const BASE = process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:4000/api";
let token: string | null = null;
export const setToken = (value: string | null) => {
  token = value;
};
async function request<T>(path: string, init: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (!res.ok)
    throw new Error((await res.json().catch(() => ({}))).message || `HTTP ${res.status}`);
  return res.json() as Promise<T>;
}
export const api = {
  login: (username: string, password: string) =>
    request<{ token: string; user: { id: string; username: string } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  books: (page = 1, limit = 12) =>
    request<{ books: Book[]; page: number; nextPage: number }>(
      `/books?page=${page}&limit=${limit}`,
    ),
  categories: (channel: string) =>
    request<{ channel: string; channels: string[]; sections: CategorySection[] }>(
      `/categories?channel=${encodeURIComponent(channel)}`,
    ),
  addShelf: (bookId: string) =>
    request("/shelf", { method: "POST", body: JSON.stringify({ bookId }) }),
  batch: (bookIds: string[], action: string) =>
    request("/shelf/batch", {
      method: "POST",
      body: JSON.stringify({ bookIds, action }),
    }),
  deleteHistory: (id: string) => request(`/history/${id}`, { method: "DELETE" }),
  sync: (payload: unknown) => request("/sync", { method: "POST", body: JSON.stringify(payload) }),
  download: (bookId: string) => request<{ chapters: any[] }>(`/books/${bookId}/download`),
};
export const aiSearchUrl = (query: string) => `${BASE}/ai/search?q=${encodeURIComponent(query)}`;

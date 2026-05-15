const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sf_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json();
  if (!res.ok) {
    const msg =
      data?.errors?.[0]?.msg || data?.error || `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export const api = {
  // Auth
  signup: (body: { email: string; password: string; organizationName: string }) =>
    request<{ token: string; user: import("@/types").User }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: import("@/types").User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  me: () => request<{ user: import("@/types").User }>("/auth/me"),

  // Dashboard
  dashboard: () => request<import("@/types").DashboardData>("/dashboard"),

  // Products
  getProducts: (search = "", page = 1, limit = 50) =>
    request<import("@/types").ProductsResponse>(
      `/products?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`
    ),

  getProduct: (id: string) =>
    request<import("@/types").Product>(`/products/${id}`),

  createProduct: (body: Partial<import("@/types").Product>) =>
    request<import("@/types").Product>("/products", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateProduct: (id: string, body: Partial<import("@/types").Product>) =>
    request<import("@/types").Product>(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  deleteProduct: (id: string) =>
    request<{ message: string }>(`/products/${id}`, { method: "DELETE" }),

  adjustStock: (id: string, delta: number, note?: string) =>
    request<{ product: import("@/types").Product }>(`/products/${id}/adjust-stock`, {
      method: "POST",
      body: JSON.stringify({ delta, note }),
    }),

  // Settings
  getSettings: () =>
    request<import("@/types").Organization>("/settings"),

  updateSettings: (body: { defaultLowStockThreshold: number }) =>
    request<import("@/types").Organization>("/settings", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};

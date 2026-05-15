export interface Organization {
  id: string;
  name: string;
  defaultLowStockThreshold: number;
}

export interface User {
  id: string;
  email: string;
  organization: Organization;
}

export interface AuthState {
  token: string;
  user: User;
}

export interface Product {
  id: string;
  organizationId: string;
  name: string;
  sku: string;
  description?: string | null;
  quantityOnHand: number;
  costPrice?: number | null;
  sellingPrice?: number | null;
  lowStockThreshold?: number | null;
  effectiveThreshold?: number;
  isLowStock?: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  stockAdjustments?: StockAdjustment[];
}

export interface StockAdjustment {
  id: string;
  productId: string;
  delta: number;
  note?: string | null;
  createdAt: string;
}

export interface DashboardData {
  totalProducts: number;
  totalUnits: number;
  lowStockCount: number;
  lowStockItems: Product[];
}

export interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  error?: string;
  errors?: Array<{ msg: string; path: string }>;
}

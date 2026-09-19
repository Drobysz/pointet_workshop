export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiCollection<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiEntity<T> {
  data: T;
}

export interface ProductImage {
  id: number;
  name: string;
  path: string;
  url: string | null;
  sort_order: number;
}

export interface Color {
  id: number;
  name: string;
  hexcode: string;
  images?: ProductImage[];
}

export interface CategoryImage {
  id: number;
  name: string;
  path: string;
  url: string | null;
}

export interface Category {
  id: number;
  name: string;
  subcategories?: Subcategory[];
  image_id?: number | null;
  image?: CategoryImage | null;
}

export interface Subcategory {
  id: number;
  name: string;
  category_id: number;
  category?: Category;
}

export interface Material {
  id: number;
  name: string;
}

export interface InventoryInput {
  id?: number;
  color_id: number;
  size: string | null;
  quantity: number;
}

export interface InventoryRow extends InventoryInput {
  id: number;
  good_id: number;
}

export interface Good {
  id: number;
  name: string;
  price: string;
  current_quantity: number;
  inventory_version: number;
  inventory: InventoryRow[];
  description: string;
  category_id: number;
  subcategory_id: number;
  category?: Category;
  subcategory: Subcategory;
  colors: Color[];
  materials?: Material[];
  created_at?: string;
}

export interface GoodPayload {
  name: string;
  category_id: number;
  subcategory_id: number;
  price: number;
  inventory_version?: number;
  inventory: InventoryInput[];
  description: string;
  material_ids: number[];
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: "user" | "admin";
  email_verified_at: string | null;
  created_at: string;
}

export interface UserPayload {
  email: string;
  full_name: string;
  avatar_url: string | null;
  password?: string;
}

export interface OrderItem {
  id: number;
  good_id: number | null;
  product_name: string;
  color_name: string | null;
  size: string | null;
  good_register_id: number | null;
  unit_price: string;
  quantity: number;
  line_total: string;
  status: string;
}

export interface Order {
  id: number;
  user_id: number | null;
  customer_name: string;
  customer_email: string;
  status: string;
  placed_at: string;
  total: string;
  customer?: User;
  items?: OrderItem[];
}

export interface DashboardSummary {
  users: number;
  orders: number;
  monthly_revenue: string;
}

export interface AnalyticsPoint {
  bucket: string;
  revenue: string;
  units: number;
}

export interface TopProduct {
  good_id: number | null;
  product_name: string;
  units: number;
  revenue: string;
}

export interface ProductStatistics {
  units: number;
  revenue: string;
  orders: number;
}

export interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
  };
}

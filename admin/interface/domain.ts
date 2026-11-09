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

export interface ApiList<T> {
  data: T[];
}

export interface ApiEntity<T> {
  data: T;
}

export interface ProductImage {
  id: number;
  color_id: number;
  name: string;
  path: string;
  url: string | null;
  sort_order: number;
}

/** One translated label with its bookkeeping, keyed by locale in `translations`. */
export interface TranslationEntry {
  name: string | null;
  name_is_manual: boolean;
  name_is_stale: boolean;
}

/** Present on administrative responses of translatable catalog records. */
export interface TranslatableEntity {
  source_locale?: string;
  translatable_fields?: string[];
  translations?: Record<string, TranslationEntry>;
}

/** Manual translation edits: `null` hands a locale back to automatic translation. */
export type TranslationsPayload = Record<string, { name: string | null }>;

export type TranslatableKind = "goods" | "categories" | "subcategories" | "colors" | "materials";

export interface TranslationUsage {
  enabled: boolean;
  provider: string;
  period: string;
  characters_used: number;
  character_limit: number | null;
  exhausted: boolean;
  exhausted_at: string | null;
}

export interface Color extends TranslatableEntity {
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

export interface Category extends TranslatableEntity {
  id: number;
  name: string;
  subcategories?: Subcategory[];
  image_id?: number | null;
  image?: CategoryImage | null;
}

export interface Subcategory extends TranslatableEntity {
  id: number;
  name: string;
  category_id: number;
  category?: Category;
}

export interface Material extends TranslatableEntity {
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

export interface Good extends TranslatableEntity {
  id: number;
  name: string;
  brand: string;
  price: string;
  weigh: number;
  current_quantity: number;
  inventory_version: number;
  inventory: InventoryRow[];
  description: string;
  visible: boolean;
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
  brand: string;
  category_id: number;
  subcategory_id: number;
  price: number;
  weigh: number;
  inventory_version?: number;
  inventory: InventoryInput[];
  description: string;
  visible: boolean;
  material_ids: number[];
  source_locale?: string;
  translations?: TranslationsPayload;
}

export interface ProductImagePayload {
  color_id: number;
  name: string;
  sort_order: number;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: "user" | "admin";
  orders_count: number;
  basket_goods_count: number;
  email_verified_at: string | null;
  created_at: string;
}

export interface UserPayload {
  email: string;
  full_name: string;
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

export type PreorderPaymentStatus = "pending" | "paid" | "failed" | "canceled" | "refunded";

export interface PreorderRegister {
  id: number;
  good_id: number | null;
  good_register_id: number | null;
  product_name: string;
  color_name: string | null;
  size: string | null;
  original_unit_price: string;
  quantity: number;
}

export interface Preorder {
  id: number;
  user_id: number | null;
  customer_name: string;
  customer_email: string;
  payment_status: PreorderPaymentStatus;
  payment_amount_cents: number;
  currency: string;
  paid_at: string | null;
  created_at: string;
  registers?: PreorderRegister[];
}

export interface PreorderAnalyticsItem {
  product_id: number;
  product_name: string;
  image_url: string | null;
  original_price: string;
  preordered_quantity: number;
}

export type SellerApplicationStatus = "processing" | "approved" | "declined";

export interface SellerApplication {
  id: number;
  first_name: string;
  last_name: string;
  tel_number: string;
  country: string;
  email: string;
  brand_name: string;
  company_address: string;
  description_of_contact: string;
  description_of_brand: string;
  isResidentOfEU: boolean;
  status: SellerApplicationStatus;
  reviewed_at: string | null;
  response_message: string | null;
  created_at: string;
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

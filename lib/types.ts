export type Role = 'ADMIN' | 'SELLER';

export type Category = 'Skincare' | 'Fragrance' | 'Makeup' | 'Cleanser';

export type StockStatus = 'In_Stock' | 'Low_Stock' | 'Pre_Order';

export type SaleStatus = 'Completed' | 'Pending' | 'Refunded';

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  sku: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  status: StockStatus;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  name: string;
  category: Category;
  sku: string;
  costPrice: number | string;
  sellingPrice: number | string;
  stockQuantity: number | string;
  imageUrl?: string;
}

export interface SaleItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: { name: string; sku: string };
}

export interface Sale {
  id: string;
  sellerName: string;
  sellerId?: string | null;
  totalAmount: number;
  taxAmount: number;
  status: SaleStatus;
  createdAt: string;
  items: SaleItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface StoreSettings {
  storeName: string;
  taxRate: number;
  currencySymbol: string;
}

export interface SellerSummary {
  sellerId: string | null;
  sellerName: string;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
}

export interface SellerSaleRow {
  saleId: string;
  date: string;
  sellerName: string;
  productName: string;
  category: string;
  quantity: number;
  amount: number;
}

export interface AnalyticsPeriod {
  range: 'all' | 'week' | 'month';
  anchor: string;
  label: string;
  start: string | null;
  end: string | null;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalGrossProfit: number;
  totalOrders: number;
  avgOrderValue: number;
  lowStockCount: number;
  revenueByDay: { date: string; revenue: number }[];
  revenueByCategory: { category: string; revenue: number }[];
  topProducts: { name: string; unitsSold: number; revenue: number }[];
  sellerSummary: SellerSummary[];
  sellerSalesLog: SellerSaleRow[];
  period: AnalyticsPeriod;
}

export interface SalesStats {
  todayRevenue: number;
  todayOrders: number;
}

export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: string;
}
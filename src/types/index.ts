export interface Product {
  id: string;
  name: string;
  defaultPrice: number;
  unit: string;
  description?: string;
  active: boolean;
  createdAt: string;
}

export interface Shopkeeper {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
}

export interface PriceMapping {
  id: string;
  shopkeeperId: string;
  productId: string;
  price: number;
  updatedAt: string;
}

export interface DailyEntryItem {
  productId: string;
  quantity: number;
  price: number; // Stored transaction price
}

export interface DailyEntry {
  id: string;
  date: string; // YYYY-MM-DD
  shopkeeperId: string;
  items: DailyEntryItem[];
  totalQuantity: number;
  totalAmount: number;
  notes?: string;
  updatedAt: string;
}

export interface AppSettings {
  currency: string;
  currencyCode: string;
  dateFormat: string;
  defaultUnit: string;
  theme: 'light' | 'dark' | 'system';
}

export interface AppDataBackup {
  version: string;
  exportDate: string;
  products: Product[];
  shopkeepers: Shopkeeper[];
  priceMappings: PriceMapping[];
  dailyEntries: DailyEntry[];
  settings: AppSettings;
}

export interface ProductSummary {
  productId: string;
  productName: string;
  quantity: number;
  amount: number;
}

export interface DailySummary {
  date: string;
  totalShopkeepers: number;
  activeShopkeepers: number;
  totalQuantity: number;
  totalAmount: number;
  productSummaries: ProductSummary[];
}

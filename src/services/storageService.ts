import { Product, Shopkeeper, PriceMapping, DailyEntry, AppSettings, AppDataBackup } from '../types';

const KEYS = {
  PRODUCTS: 'dom_products',
  SHOPKEEPERS: 'dom_shopkeepers',
  PRICE_MAPPINGS: 'dom_price_mappings',
  DAILY_ENTRIES: 'dom_daily_entries',
  SETTINGS: 'dom_settings',
  INITIALIZED: 'dom_initialized_v1',
};

const DEFAULT_SETTINGS: AppSettings = {
  currency: '₹',
  currencyCode: 'INR',
  dateFormat: 'DD/MM/YYYY',
  defaultUnit: 'unit',
  theme: 'light',
};

// Initial Seed Data
const INITIAL_PRODUCTS: Product[] = [
  { id: 'prod-1', name: 'Cow', defaultPrice: 13, unit: 'unit', active: true, createdAt: new Date().toISOString() },
  { id: 'prod-2', name: 'Taja', defaultPrice: 29, unit: 'unit', active: true, createdAt: new Date().toISOString() },
  { id: 'prod-3', name: 'Masti', defaultPrice: 19, unit: 'unit', active: true, createdAt: new Date().toISOString() },
  { id: 'prod-4', name: 'Prime Chasa', defaultPrice: 17, unit: 'unit', active: true, createdAt: new Date().toISOString() },
  { id: 'prod-5', name: 'Sadi Chasa', defaultPrice: 15, unit: 'unit', active: true, createdAt: new Date().toISOString() },
  { id: 'prod-6', name: 'Tadka Chaha', defaultPrice: 10, unit: 'unit', active: true, createdAt: new Date().toISOString() },
  { id: 'prod-7', name: 'Jira', defaultPrice: 7, unit: 'unit', active: true, createdAt: new Date().toISOString() },
  { id: 'prod-8', name: 'Panir', defaultPrice: 45, unit: 'unit', active: true, createdAt: new Date().toISOString() },
];

const INITIAL_SHOPKEEPER_NAMES = [
  'Anshu', 'Manisha', 'Ravi', 'Amrat', 'Dani', 'Amit', 'Jitu', 'Sailesh',
  'Kiran', 'Nanu', 'Girish', 'Vasu', 'Bharat', 'Raman', 'Mayur', 'Anup',
  'Harshu', 'Manan', 'Jitesh', 'Dalpat', 'Varsha', 'Pintu', 'Daman', 'Mani'
];

const INITIAL_SHOPKEEPERS: Shopkeeper[] = INITIAL_SHOPKEEPER_NAMES.map((name, index) => ({
  id: `sk-${index + 1}`,
  name,
  phone: `98765${(10000 + index).toString().substring(1)}`,
  address: `Shop No. ${index + 1}, Main Market`,
  active: true,
  createdAt: new Date().toISOString(),
}));

// Helper to format date string YYYY-MM-DD
export function getFormattedDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function initializeStorageIfNeeded(): void {
  if (localStorage.getItem(KEYS.INITIALIZED)) {
    return;
  }

  // Save initial products
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  // Save initial shopkeepers
  localStorage.setItem(KEYS.SHOPKEEPERS, JSON.stringify(INITIAL_SHOPKEEPERS));
  // Save default settings
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  // Save empty initial mappings
  localStorage.setItem(KEYS.PRICE_MAPPINGS, JSON.stringify([]));

  // Seed sample daily entries for today and yesterday to make UI immediately populated
  const todayStr = getFormattedDate();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getFormattedDate(yesterday);

  const sampleEntries: DailyEntry[] = [];

  // Seed Today's sample data for first 6 shopkeepers
  const sampleDataToday: Array<{ skIndex: number; items: Record<string, number> }> = [
    { skIndex: 0, items: { 'prod-1': 5, 'prod-2': 2, 'prod-3': 3, 'prod-7': 4 } }, // Anshu
    { skIndex: 1, items: { 'prod-1': 3, 'prod-2': 5, 'prod-3': 2, 'prod-4': 1, 'prod-7': 2, 'prod-8': 1 } }, // Manisha
    { skIndex: 2, items: { 'prod-1': 8, 'prod-3': 4, 'prod-4': 2, 'prod-5': 1, 'prod-6': 3 } }, // Ravi
    { skIndex: 3, items: { 'prod-1': 10, 'prod-2': 4, 'prod-6': 5 } }, // Amrat
    { skIndex: 4, items: { 'prod-2': 3, 'prod-3': 5, 'prod-7': 6, 'prod-8': 2 } }, // Dani
    { skIndex: 5, items: { 'prod-1': 6, 'prod-4': 3, 'prod-5': 4, 'prod-6': 2 } }, // Amit
  ];

  sampleDataToday.forEach((sample, i) => {
    const sk = INITIAL_SHOPKEEPERS[sample.skIndex];
    let totalQty = 0;
    let totalAmt = 0;
    const items = Object.entries(sample.items).map(([pId, qty]) => {
      const prod = INITIAL_PRODUCTS.find(p => p.id === pId);
      const price = prod ? prod.defaultPrice : 0;
      totalQty += qty;
      totalAmt += qty * price;
      return { productId: pId, quantity: qty, price };
    });

    sampleEntries.push({
      id: `entry-today-${i + 1}`,
      date: todayStr,
      shopkeeperId: sk.id,
      items,
      totalQuantity: totalQty,
      totalAmount: totalAmt,
      updatedAt: new Date().toISOString(),
    });
  });

  // Seed Yesterday sample data
  sampleDataToday.forEach((sample, i) => {
    const sk = INITIAL_SHOPKEEPERS[sample.skIndex];
    let totalQty = 0;
    let totalAmt = 0;
    const items = Object.entries(sample.items).map(([pId, qty]) => {
      const prod = INITIAL_PRODUCTS.find(p => p.id === pId);
      const price = prod ? prod.defaultPrice : 0;
      const adjustedQty = Math.max(1, qty + (i % 2 === 0 ? 1 : -1));
      totalQty += adjustedQty;
      totalAmt += adjustedQty * price;
      return { productId: pId, quantity: adjustedQty, price };
    });

    sampleEntries.push({
      id: `entry-yest-${i + 1}`,
      date: yesterdayStr,
      shopkeeperId: sk.id,
      items,
      totalQuantity: totalQty,
      totalAmount: totalAmt,
      updatedAt: new Date().toISOString(),
    });
  });

  localStorage.setItem(KEYS.DAILY_ENTRIES, JSON.stringify(sampleEntries));
  localStorage.setItem(KEYS.INITIALIZED, 'true');
}

// Storage Accessors
export function getProducts(): Product[] {
  initializeStorageIfNeeded();
  try {
    const data = localStorage.getItem(KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
}

export function getShopkeepers(): Shopkeeper[] {
  initializeStorageIfNeeded();
  try {
    const data = localStorage.getItem(KEYS.SHOPKEEPERS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveShopkeepers(shopkeepers: Shopkeeper[]): void {
  localStorage.setItem(KEYS.SHOPKEEPERS, JSON.stringify(shopkeepers));
}

export function getPriceMappings(): PriceMapping[] {
  initializeStorageIfNeeded();
  try {
    const data = localStorage.getItem(KEYS.PRICE_MAPPINGS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function savePriceMappings(mappings: PriceMapping[]): void {
  localStorage.setItem(KEYS.PRICE_MAPPINGS, JSON.stringify(mappings));
}

export function getDailyEntries(): DailyEntry[] {
  initializeStorageIfNeeded();
  try {
    const data = localStorage.getItem(KEYS.DAILY_ENTRIES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveDailyEntries(entries: DailyEntry[]): void {
  localStorage.setItem(KEYS.DAILY_ENTRIES, JSON.stringify(entries));
}

export function getSettings(): AppSettings {
  initializeStorageIfNeeded();
  try {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

// Backup & Restore
export function exportBackup(): AppDataBackup {
  return {
    version: '1.0',
    exportDate: new Date().toISOString(),
    products: getProducts(),
    shopkeepers: getShopkeepers(),
    priceMappings: getPriceMappings(),
    dailyEntries: getDailyEntries(),
    settings: getSettings(),
  };
}

export function importBackup(backup: AppDataBackup): boolean {
  try {
    if (!backup.products || !backup.shopkeepers || !backup.dailyEntries) {
      throw new Error('Invalid backup structure');
    }
    saveProducts(backup.products);
    saveShopkeepers(backup.shopkeepers);
    savePriceMappings(backup.priceMappings || []);
    saveDailyEntries(backup.dailyEntries);
    if (backup.settings) {
      saveSettings(backup.settings);
    }
    localStorage.setItem(KEYS.INITIALIZED, 'true');
    return true;
  } catch (err) {
    console.error('Failed to restore backup:', err);
    return false;
  }
}

export function clearAllData(): void {
  localStorage.clear();
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify([]));
  localStorage.setItem(KEYS.SHOPKEEPERS, JSON.stringify([]));
  localStorage.setItem(KEYS.PRICE_MAPPINGS, JSON.stringify([]));
  localStorage.setItem(KEYS.DAILY_ENTRIES, JSON.stringify([]));
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  localStorage.setItem(KEYS.INITIALIZED, 'true');
}

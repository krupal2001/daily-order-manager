import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Shopkeeper, PriceMapping, DailyEntry, AppSettings, AppDataBackup } from '../types';
import * as storage from '../services/storageService';
import { getEffectiveProductPrice, calculateRowTotals, getPreviousDateStr } from '../services/calculationService';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  products: Product[];
  shopkeepers: Shopkeeper[];
  priceMappings: PriceMapping[];
  dailyEntries: DailyEntry[];
  settings: AppSettings;
  toasts: ToastMessage[];

  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  refreshData: () => void;

  // Products CRUD
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;

  // Shopkeepers CRUD
  addShopkeeper: (shopkeeper: Omit<Shopkeeper, 'id' | 'createdAt'>) => void;
  updateShopkeeper: (shopkeeper: Shopkeeper) => void;
  deleteShopkeeper: (id: string) => void;

  // Pricing Mapping
  updatePriceMapping: (shopkeeperId: string, productId: string, price: number | null) => void;
  updateShopkeeperPriceMappings: (
    shopkeeperId: string,
    mappings: Record<string, number | null>
  ) => void;

  // Daily Entry
  saveDailyEntryItem: (date: string, shopkeeperId: string, productId: string, quantity: number) => void;
  saveFullDailyEntriesForDate: (date: string, entriesMap: Record<string, Record<string, number>>) => void;
  copyPreviousDay: (targetDate: string) => boolean;
  clearDailyEntriesForDate: (date: string) => void;

  // Settings & Backup
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  importBackupData: (backup: AppDataBackup) => boolean;
  resetAll: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [shopkeepers, setShopkeepers] = useState<Shopkeeper[]>([]);
  const [priceMappings, setPriceMappings] = useState<PriceMapping[]>([]);
  const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>(storage.getSettings());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const refreshData = useCallback(() => {
    storage.initializeStorageIfNeeded();
    setProducts(storage.getProducts());
    setShopkeepers(storage.getShopkeepers());
    setPriceMappings(storage.getPriceMappings());
    setDailyEntries(storage.getDailyEntries());
    setSettings(storage.getSettings());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Products Operations
  const addProduct = (prodData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...products, newProduct];
    setProducts(updated);
    storage.saveProducts(updated);
    showToast(`Product "${newProduct.name}" added successfully.`);
  };

  const updateProduct = (updatedProd: Product) => {
    const updated = products.map((p) => (p.id === updatedProd.id ? updatedProd : p));
    setProducts(updated);
    storage.saveProducts(updated);
    showToast(`Product "${updatedProd.name}" updated successfully.`);
  };

  const deleteProduct = (id: string) => {
    const prod = products.find((p) => p.id === id);
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    storage.saveProducts(updated);
    showToast(`Product "${prod?.name || ''}" deleted successfully.`);
  };

  // Shopkeepers Operations
  const addShopkeeper = (skData: Omit<Shopkeeper, 'id' | 'createdAt'>) => {
    const newSk: Shopkeeper = {
      ...skData,
      id: `sk-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...shopkeepers, newSk];
    setShopkeepers(updated);
    storage.saveShopkeepers(updated);
    showToast(`Shopkeeper "${newSk.name}" added successfully.`);
  };

  const updateShopkeeper = (updatedSk: Shopkeeper) => {
    const updated = shopkeepers.map((s) => (s.id === updatedSk.id ? updatedSk : s));
    setShopkeepers(updated);
    storage.saveShopkeepers(updated);
    showToast(`Shopkeeper "${updatedSk.name}" updated successfully.`);
  };

  const deleteShopkeeper = (id: string) => {
    const sk = shopkeepers.find((s) => s.id === id);
    const updated = shopkeepers.filter((s) => s.id !== id);
    setShopkeepers(updated);
    storage.saveShopkeepers(updated);
    showToast(`Shopkeeper "${sk?.name || ''}" deleted successfully.`);
  };

  // Price Mapping
  const updateShopkeeperPriceMappings = (
    shopkeeperId: string,
    newPricesMap: Record<string, number | null>
  ) => {
    let updated = [...priceMappings];

    Object.entries(newPricesMap).forEach(([productId, price]) => {
      if (price === null || price < 0) {
        updated = updated.filter(
          (m) => !(m.shopkeeperId === shopkeeperId && m.productId === productId)
        );
      } else {
        const existingIndex = updated.findIndex(
          (m) => m.shopkeeperId === shopkeeperId && m.productId === productId
        );
        if (existingIndex >= 0) {
          updated[existingIndex] = {
            ...updated[existingIndex],
            price,
            updatedAt: new Date().toISOString(),
          };
        } else {
          updated.push({
            id: `pm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            shopkeeperId,
            productId,
            price,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    });

    setPriceMappings(updated);
    storage.savePriceMappings(updated);

    // Update existing daily entries for this shopkeeper so their price and total amount reflect updated prices
    const updatedEntries = dailyEntries.map((entry) => {
      if (entry.shopkeeperId !== shopkeeperId) return entry;
      let entryChanged = false;
      const updatedItems = entry.items.map((item) => {
        if (newPricesMap[item.productId] !== undefined) {
          const newEffectivePrice = getEffectiveProductPrice(item.productId, shopkeeperId, updated, products);
          if (item.price !== newEffectivePrice) {
            entryChanged = true;
            return { ...item, price: newEffectivePrice };
          }
        }
        return item;
      });

      if (!entryChanged) return entry;
      const { totalQuantity, totalAmount } = calculateRowTotals(updatedItems);
      return {
        ...entry,
        items: updatedItems,
        totalQuantity,
        totalAmount,
        updatedAt: new Date().toISOString(),
      };
    });

    setDailyEntries(updatedEntries);
    storage.saveDailyEntries(updatedEntries);
    showToast('Shopkeeper price mapping saved successfully.');
  };

  const updatePriceMapping = (shopkeeperId: string, productId: string, price: number | null) => {
    updateShopkeeperPriceMappings(shopkeeperId, { [productId]: price });
  };

  // Daily Entry Item Update
  const saveDailyEntryItem = (
    date: string,
    shopkeeperId: string,
    productId: string,
    quantity: number
  ) => {
    const currentEntries = [...dailyEntries];
    let entry = currentEntries.find((e) => e.date === date && e.shopkeeperId === shopkeeperId);

    const price = getEffectiveProductPrice(productId, shopkeeperId, priceMappings, products);

    if (!entry) {
      entry = {
        id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        date,
        shopkeeperId,
        items: [{ productId, quantity, price }],
        totalQuantity: 0,
        totalAmount: 0,
        updatedAt: new Date().toISOString(),
      };
      currentEntries.push(entry);
    } else {
      const itemIndex = entry.items.findIndex((i) => i.productId === productId);
      if (itemIndex >= 0) {
        if (quantity <= 0) {
          entry.items.splice(itemIndex, 1);
        } else {
          entry.items[itemIndex] = {
            ...entry.items[itemIndex],
            quantity,
            price,
          };
        }
      } else if (quantity > 0) {
        entry.items.push({ productId, quantity, price });
      }
    }

    const { totalQuantity, totalAmount } = calculateRowTotals(entry.items);
    entry.totalQuantity = totalQuantity;
    entry.totalAmount = totalAmount;
    entry.updatedAt = new Date().toISOString();

    setDailyEntries(currentEntries);
    storage.saveDailyEntries(currentEntries);
  };

  // Batch Save Full Daily Entries for a Date
  const saveFullDailyEntriesForDate = (
    date: string,
    entriesMap: Record<string, Record<string, number>>
  ) => {
    let currentEntries = dailyEntries.filter((e) => e.date !== date);

    Object.entries(entriesMap).forEach(([shopkeeperId, productQtyMap]) => {
      const items: { productId: string; quantity: number; price: number }[] = [];

      Object.entries(productQtyMap).forEach(([productId, quantity]) => {
        if (quantity > 0) {
          const price = getEffectiveProductPrice(productId, shopkeeperId, priceMappings, products);
          items.push({ productId, quantity, price });
        }
      });

      if (items.length > 0) {
        const { totalQuantity, totalAmount } = calculateRowTotals(items);
        currentEntries.push({
          id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          date,
          shopkeeperId,
          items,
          totalQuantity,
          totalAmount,
          updatedAt: new Date().toISOString(),
        });
      }
    });

    setDailyEntries(currentEntries);
    storage.saveDailyEntries(currentEntries);
    showToast(`Daily entries for ${date} saved successfully!`);
  };

  // Copy Previous Day Entries into Target Date Draft
  const copyPreviousDay = (targetDate: string): boolean => {
    const prevDate = getPreviousDateStr(targetDate);
    const prevEntries = dailyEntries.filter((e) => e.date === prevDate);

    if (prevEntries.length === 0) {
      showToast(`No entries found for previous day (${prevDate}).`, 'info');
      return false;
    }

    const newEntriesMap: Record<string, Record<string, number>> = {};

    prevEntries.forEach((entry) => {
      newEntriesMap[entry.shopkeeperId] = {};
      entry.items.forEach((item) => {
        newEntriesMap[entry.shopkeeperId][item.productId] = item.quantity;
      });
    });

    saveFullDailyEntriesForDate(targetDate, newEntriesMap);
    showToast(`Copied ${prevEntries.length} shopkeeper entries from ${prevDate}.`);
    return true;
  };

  // Clear Daily Entries for Date
  const clearDailyEntriesForDate = (date: string) => {
    const updated = dailyEntries.filter((e) => e.date !== date);
    setDailyEntries(updated);
    storage.saveDailyEntries(updated);
    showToast(`Cleared all entries for ${date}.`);
  };

  // Settings & Data Management
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    storage.saveSettings(updated);
    showToast('Settings saved successfully.');
  };

  const importBackupData = (backup: AppDataBackup): boolean => {
    const success = storage.importBackup(backup);
    if (success) {
      refreshData();
      showToast('Backup restored successfully!');
    } else {
      showToast('Failed to import backup data.', 'error');
    }
    return success;
  };

  const resetAll = () => {
    storage.clearAllData();
    refreshData();
    showToast('All local storage data cleared. Application is now empty.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        products,
        shopkeepers,
        priceMappings,
        dailyEntries,
        settings,
        toasts,
        showToast,
        removeToast,
        refreshData,
        addProduct,
        updateProduct,
        deleteProduct,
        addShopkeeper,
        updateShopkeeper,
        deleteShopkeeper,
        updatePriceMapping,
        updateShopkeeperPriceMappings,
        saveDailyEntryItem,
        saveFullDailyEntriesForDate,
        copyPreviousDay,
        clearDailyEntriesForDate,
        updateSettings,
        importBackupData,
        resetAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

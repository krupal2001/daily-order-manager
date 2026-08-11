import { Product, Shopkeeper, PriceMapping, DailyEntry, DailyEntryItem, ProductSummary, DailySummary } from '../types';

/**
 * Resolves price for a shopkeeper and product.
 * Priority: 1. Shopkeeper-specific price mapping 2. Product master default price.
 */
export function getApplicablePrice(
  shopkeeperId: string,
  productId: string,
  priceMappings: PriceMapping[],
  products: Product[]
): number {
  const mapping = priceMappings.find(
    (m) => m.shopkeeperId === shopkeeperId && m.productId === productId
  );
  if (mapping && typeof mapping.price === 'number' && mapping.price >= 0) {
    return mapping.price;
  }
  const product = products.find((p) => p.id === productId);
  return product ? product.defaultPrice : 0;
}

/**
 * Calculates shopkeeper entry row totals.
 */
export function calculateRowTotals(
  items: DailyEntryItem[]
): { totalQuantity: number; totalAmount: number } {
  let totalQuantity = 0;
  let totalAmount = 0;

  for (const item of items) {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    if (qty > 0) {
      totalQuantity += qty;
      totalAmount += qty * price;
    }
  }

  return { totalQuantity, totalAmount };
}

/**
 * Calculates overall day summary and per-product summary totals across all shopkeeper entries.
 */
export function getDailySummaryForDate(
  date: string,
  dailyEntries: DailyEntry[],
  shopkeepers: Shopkeeper[],
  products: Product[]
): DailySummary {
  const entriesForDate = dailyEntries.filter((e) => e.date === date);
  const activeShopkeepersCount = entriesForDate.filter((e) => e.totalQuantity > 0).length;

  let grandTotalQty = 0;
  let grandTotalAmt = 0;

  // Initialize product summary map
  const productSummaryMap: Record<string, { quantity: number; amount: number; name: string }> = {};

  products.forEach((p) => {
    productSummaryMap[p.id] = { quantity: 0, amount: 0, name: p.name };
  });

  entriesForDate.forEach((entry) => {
    grandTotalQty += entry.totalQuantity || 0;
    grandTotalAmt += entry.totalAmount || 0;

    entry.items.forEach((item) => {
      const qty = item.quantity || 0;
      const price = item.price || 0;
      if (qty > 0) {
        if (!productSummaryMap[item.productId]) {
          const prod = products.find((p) => p.id === item.productId);
          productSummaryMap[item.productId] = {
            quantity: 0,
            amount: 0,
            name: prod ? prod.name : 'Unknown Product',
          };
        }
        productSummaryMap[item.productId].quantity += qty;
        productSummaryMap[item.productId].amount += qty * price;
      }
    });
  });

  const productSummaries: ProductSummary[] = Object.entries(productSummaryMap).map(
    ([productId, data]) => ({
      productId,
      productName: data.name,
      quantity: data.quantity,
      amount: data.amount,
    })
  );

  return {
    date,
    totalShopkeepers: shopkeepers.filter((s) => s.active).length,
    activeShopkeepers: activeShopkeepersCount,
    totalQuantity: grandTotalQty,
    totalAmount: grandTotalAmt,
    productSummaries,
  };
}

/**
 * Date Helper Utility Functions
 */
export function getPreviousDateStr(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export function getNextDateStr(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export function formatDisplayDate(dateStr: string, format = 'DD/MM/YYYY'): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  if (format === 'DD/MM/YYYY') {
    return `${day}/${month}/${year}`;
  }
  return dateStr;
}

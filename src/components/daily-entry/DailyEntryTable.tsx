import React from 'react';
import { Shopkeeper, Product } from '../../types';
import { ProductQuantityInput } from './ProductQuantityInput';
import { DailyTotals } from './DailyTotals';

interface DailyEntryTableProps {
  shopkeepers: Shopkeeper[];
  products: Product[];
  entriesMap: Record<string, Record<string, number>>; // shopkeeperId -> productId -> quantity
  pricesMap: Record<string, Record<string, number>>; // shopkeeperId -> productId -> price
  onQuantityChange: (shopkeeperId: string, productId: string, newQty: number) => void;
}

export const DailyEntryTable: React.FC<DailyEntryTableProps> = ({
  shopkeepers,
  products,
  entriesMap,
  pricesMap,
  onQuantityChange,
}) => {
  // Calculate column totals per product
  const productTotalsMap: Record<string, number> = {};
  products.forEach((p) => (productTotalsMap[p.id] = 0));

  let grandTotalQty = 0;
  let grandTotalAmount = 0;

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-900 text-white text-xs uppercase font-extrabold tracking-wider border-b border-slate-800">
            {/* Sticky Shopkeeper Header */}
            <th className="px-4 py-4 sticky left-0 z-30 bg-slate-950 shadow-r border-r border-slate-800 min-w-[180px]">
              Shopkeeper Name
            </th>

            {/* Dynamic Product Columns */}
            {products.map((product) => (
              <th key={product.id} className="px-2 py-4 text-center border-r border-slate-800 min-w-[90px]">
                <div className="font-bold text-white text-sm truncate">{product.name}</div>
                <div className="text-[10px] text-slate-400 font-normal">₹{product.defaultPrice}</div>
              </th>
            ))}

            {/* Total Qty Header */}
            <th className="px-4 py-4 text-center border-r border-slate-800 min-w-[100px] text-amber-400">
              Total Qty
            </th>

            {/* Total Amount Header */}
            <th className="px-4 py-4 text-right sticky right-0 z-30 bg-slate-950 shadow-l min-w-[120px] text-emerald-400">
              Total Amount
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm font-medium">
          {shopkeepers.map((sk) => {
            const skQuantities = entriesMap[sk.id] || {};
            const skPrices = pricesMap[sk.id] || {};

            let rowTotalQty = 0;
            let rowTotalAmt = 0;

            products.forEach((p) => {
              const qty = skQuantities[p.id] || 0;
              const price = skPrices[p.id] || p.defaultPrice;
              if (qty > 0) {
                rowTotalQty += qty;
                rowTotalAmt += qty * price;
                productTotalsMap[p.id] = (productTotalsMap[p.id] || 0) + qty;
              }
            });

            grandTotalQty += rowTotalQty;
            grandTotalAmount += rowTotalAmt;

            const isRowActive = rowTotalQty > 0;

            return (
              <tr
                key={sk.id}
                className={`transition-colors hover:bg-indigo-50/40 dark:hover:bg-slate-800/60 ${
                  isRowActive ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''
                }`}
              >
                {/* Sticky Shopkeeper Name Column */}
                <td className="px-4 py-2.5 sticky left-0 z-20 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-r">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                    <span>{sk.name}</span>
                    {isRowActive && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active order"></span>
                    )}
                  </div>
                </td>

                {/* Product Quantity Input Cells */}
                {products.map((product) => {
                  const qty = skQuantities[product.id] || 0;
                  const price = skPrices[product.id] || product.defaultPrice;

                  return (
                    <td key={product.id} className="p-1 border-r border-slate-100 dark:border-slate-800/80">
                      <ProductQuantityInput
                        quantity={qty}
                        price={price}
                        productName={product.name}
                        onChange={(newQty) => onQuantityChange(sk.id, product.id, newQty)}
                      />
                    </td>
                  );
                })}

                {/* Total Qty Cell */}
                <td className="px-4 py-2.5 text-center font-extrabold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800">
                  <span className={rowTotalQty > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}>
                    {rowTotalQty}
                  </span>
                </td>

                {/* Total Amount Cell */}
                <td className="px-4 py-2.5 text-right font-extrabold text-slate-900 dark:text-white sticky right-0 z-20 bg-white dark:bg-slate-900 shadow-l">
                  <span className={rowTotalAmt > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
                    ₹{rowTotalAmt.toLocaleString('en-IN')}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>

        {/* Bottom Total Row */}
        <tfoot>
          <DailyTotals
            products={products}
            productTotalsMap={productTotalsMap}
            grandTotalQuantity={grandTotalQty}
            grandTotalAmount={grandTotalAmount}
          />
        </tfoot>
      </table>
    </div>
  );
};

import React from 'react';
import { Shopkeeper, Product } from '../../types';
import { ProductQuantityInput } from './ProductQuantityInput';
import { DailyTotals } from './DailyTotals';
import { Printer } from 'lucide-react';

interface DailyEntryTableProps {
  shopkeepers: Shopkeeper[];
  products: Product[];
  entriesMap: Record<string, Record<string, number>>; // shopkeeperId -> productId -> quantity
  adjustmentsMap?: Record<string, number>; // shopkeeperId -> adjustment
  pricesMap: Record<string, Record<string, number>>; // shopkeeperId -> productId -> price
  onQuantityChange: (shopkeeperId: string, productId: string, newQty: number) => void;
  onAdjustmentChange?: (shopkeeperId: string, newAdj: number) => void;
  onPrintBill?: (shopkeeper: Shopkeeper) => void;
}

export const DailyEntryTable: React.FC<DailyEntryTableProps> = ({
  shopkeepers,
  products,
  entriesMap,
  adjustmentsMap = {},
  pricesMap,
  onQuantityChange,
  onAdjustmentChange,
  onPrintBill,
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
            <th className="px-4 py-4 sticky left-0 z-30 bg-slate-950 shadow-r border-r border-slate-800 min-w-[200px]">
              Shopkeeper Name
            </th>

            {/* Dynamic Product Columns */}
            {products.map((product) => (
              <th key={product.id} className="px-2 py-4 text-center border-r border-slate-800 min-w-[90px]">
                <div className="font-bold text-white text-sm truncate">{product.name}</div>
                <div className="text-[10px] text-slate-400 font-normal">₹{product.defaultPrice}</div>
              </th>
            ))}

            {/* Adjustment Column Header */}
            <th className="px-3 py-4 text-center border-r border-slate-800 min-w-[110px] text-indigo-400">
              Adjustment (+ / -)
            </th>

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
            let itemsSubtotal = 0;

            products.forEach((p) => {
              const qty = skQuantities[p.id] || 0;
              const price = skPrices[p.id] || p.defaultPrice;
              if (qty > 0) {
                rowTotalQty += qty;
                itemsSubtotal += qty * price;
                productTotalsMap[p.id] = (productTotalsMap[p.id] || 0) + qty;
              }
            });

            const skAdj = Number(adjustmentsMap[sk.id]) || 0;
            const rowTotalAmt = itemsSubtotal + skAdj;

            grandTotalQty += rowTotalQty;
            grandTotalAmount += rowTotalAmt;

            const isRowActive = rowTotalQty > 0 || skAdj !== 0;

            return (
              <tr
                key={sk.id}
                className={`transition-colors hover:bg-indigo-50/40 dark:hover:bg-slate-800/60 ${
                  isRowActive ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''
                }`}
              >
                {/* Sticky Shopkeeper Name Column */}
                <td className="px-4 py-2.5 sticky left-0 z-20 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-r">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between gap-2">
                    <span className="truncate">{sk.name}</span>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      {onPrintBill && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPrintBill(sk);
                          }}
                          title={`Print Bill for ${sk.name}`}
                          className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {isRowActive && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active order"></span>
                      )}
                    </div>
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

                {/* Adjustment Input Cell */}
                <td className="p-1 border-r border-slate-100 dark:border-slate-800/80 text-center min-w-[130px]">
                  {(() => {
                    const currentAdj = adjustmentsMap[sk.id] || 0;
                    const adjStr = currentAdj.toString();
                    const isNeg = adjStr.startsWith('-');
                    const absVal = Math.abs(currentAdj);
                    const displayVal = absVal === 0 ? '' : absVal;

                    return (
                      <div className="flex items-center justify-center space-x-1">
                        {/* Left Minus Button */}
                        <button
                          type="button"
                          onClick={() => onAdjustmentChange && onAdjustmentChange(sk.id, -absVal)}
                          className={`w-6 h-6 rounded-md font-extrabold text-xs transition-colors cursor-pointer flex items-center justify-center ${
                            isNeg
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-500 hover:text-white'
                          }`}
                          title="Subtract (-)"
                        >
                          -
                        </button>

                        {/* Middle Input Box */}
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={displayVal}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            onAdjustmentChange && onAdjustmentChange(sk.id, isNeg ? -val : val);
                          }}
                          placeholder="0.00"
                          className="w-16 text-center py-1 px-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                        />

                        {/* Right Plus Button */}
                        <button
                          type="button"
                          onClick={() => onAdjustmentChange && onAdjustmentChange(sk.id, absVal)}
                          className={`w-6 h-6 rounded-md font-extrabold text-xs transition-colors cursor-pointer flex items-center justify-center ${
                            !isNeg
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-500 hover:text-white'
                          }`}
                          title="Add (+)"
                        >
                          +
                        </button>
                      </div>
                    );
                  })()}
                </td>

                {/* Total Qty Cell */}
                <td className="px-4 py-2.5 text-center font-extrabold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800">
                  <span className={rowTotalQty > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}>
                    {rowTotalQty}
                  </span>
                </td>

                {/* Total Amount Cell */}
                <td className="px-4 py-2.5 text-right font-extrabold text-slate-900 dark:text-white sticky right-0 z-20 bg-white dark:bg-slate-900 shadow-l">
                  <span className={rowTotalAmt > 0 ? 'text-emerald-600 dark:text-emerald-400' : (rowTotalAmt < 0 ? 'text-rose-600' : 'text-slate-400')}>
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

import React, { useState } from 'react';
import { Shopkeeper, Product } from '../../types';
import { ChevronDown, ChevronUp, Plus, Minus, User, Check, Printer } from 'lucide-react';

interface MobileShopkeeperCardProps {
  shopkeeper: Shopkeeper;
  products: Product[];
  quantitiesMap: Record<string, number>; // productId -> quantity
  pricesMap: Record<string, number>; // productId -> resolved applicable price
  adjustmentVal?: number | string;
  onQuantityChange: (productId: string, newQty: number) => void;
  onAdjustmentChange?: (newAdj: number) => void;
  onPrintBill?: (shopkeeper: Shopkeeper) => void;
}

export const MobileShopkeeperCard: React.FC<MobileShopkeeperCardProps> = ({
  shopkeeper,
  products,
  quantitiesMap,
  pricesMap,
  adjustmentVal = 0,
  onQuantityChange,
  onAdjustmentChange,
  onPrintBill,
}) => {
  const [expanded, setExpanded] = useState(false);

  // Calculate shopkeeper totals
  let totalQty = 0;
  let itemsSubtotal = 0;
  let activeItemCount = 0;

  products.forEach((p) => {
    const qty = quantitiesMap[p.id] || 0;
    const price = pricesMap[p.id] || p.defaultPrice;
    if (qty > 0) {
      totalQty += qty;
      itemsSubtotal += qty * price;
      activeItemCount++;
    }
  });

  const adjVal = Number(adjustmentVal) || 0;
  const netTotalAmount = itemsSubtotal + adjVal;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all duration-200">
      {/* Card Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
              {shopkeeper.name}
            </h4>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {activeItemCount > 0 ? `${activeItemCount} Products` : 'No items entered'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onPrintBill && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrintBill(shopkeeper);
              }}
              title={`Print Bill for ${shopkeeper.name}`}
              className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
          )}

          <div className="text-right">
            <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
              ₹{netTotalAmount.toLocaleString('en-IN')}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {totalQty} Qty
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600 p-1">
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expanded Product Controls */}
      {expanded && (
        <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-700 space-y-3">
          {products.map((product) => {
            const qty = quantitiesMap[product.id] || 0;
            const price = pricesMap[product.id] || product.defaultPrice;
            const itemAmount = qty * price;

            return (
              <div
                key={product.id}
                className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700"
              >
                <div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {product.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    ₹{price} / {product.unit}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl">
                    <button
                      onClick={() => onQuantityChange(product.id, Math.max(0, qty - 1))}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-sm shadow-sm active:scale-95 transition-transform"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <input
                      type="number"
                      min="0"
                      value={!qty || isNaN(qty) ? '' : qty}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        onQuantityChange(product.id, isNaN(val) || val < 0 ? 0 : val);
                      }}
                      placeholder="0"
                      className="w-12 text-center bg-transparent font-extrabold text-sm text-indigo-950 dark:text-indigo-200 outline-none"
                    />

                    <button
                      onClick={() => onQuantityChange(product.id, qty + 1)}
                      className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm active:scale-95 transition-transform"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="w-16 text-right">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      ₹{itemAmount}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Adjustment Input Field */}
          {(() => {
            const currentAdjStr = (adjustmentVal || 0).toString();
            const isNegative = currentAdjStr.startsWith('-');
            const displayVal = currentAdjStr.replace('-', '');

            return (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-indigo-50/50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/60 gap-2">
                <div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Adjustment
                  </div>
                  <div className="text-xs text-slate-500">
                    No change / balance adjustment
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  {/* Left Minus Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const num = parseFloat(displayVal) || 0;
                      onAdjustmentChange && onAdjustmentChange(-num);
                    }}
                    className={`w-8 h-8 rounded-lg font-black text-sm transition-all shadow-sm flex items-center justify-center cursor-pointer ${
                      isNegative
                        ? 'bg-rose-600 text-white shadow-rose-500/20 ring-2 ring-rose-600/30'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-500 hover:text-white'
                    }`}
                    title="Subtract (-)"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  {/* Middle Numeric Input */}
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={displayVal === '0' ? '' : displayVal}
                    onChange={(e) => {
                      const cleanVal = parseFloat(e.target.value) || 0;
                      onAdjustmentChange && onAdjustmentChange(isNegative ? -cleanVal : cleanVal);
                    }}
                    placeholder="0.00"
                    className="w-20 text-center py-1.5 px-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  {/* Right Plus Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const num = parseFloat(displayVal) || 0;
                      onAdjustmentChange && onAdjustmentChange(num);
                    }}
                    className={`w-8 h-8 rounded-lg font-black text-sm transition-all shadow-sm flex items-center justify-center cursor-pointer ${
                      !isNegative
                        ? 'bg-emerald-600 text-white shadow-emerald-500/20 ring-2 ring-emerald-600/30'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-500 hover:text-white'
                    }`}
                    title="Add (+)"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Shopkeeper Card Footer Summary */}
          <div className="pt-3 mt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm">
            <div>
              <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                Total Qty:{' '}
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
                  {totalQty} Qty
                </span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-0.5">
                Items Subtotal: ₹{itemsSubtotal.toLocaleString('en-IN')}{' '}
                {adjVal !== 0 && (
                  <span className={`text-xs ml-1 font-bold ${adjVal > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ({adjVal > 0 ? '+' : ''}₹{adjVal})
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-0.5">
                Net Total:{' '}
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                  ₹{netTotalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={() => setExpanded(false)}
              className="flex items-center space-x-1 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-extrabold shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Done</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

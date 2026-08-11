import React from 'react';
import { Product } from '../../types';

interface DailyTotalsProps {
  products: Product[];
  productTotalsMap: Record<string, number>;
  grandTotalQuantity: number;
  grandTotalAmount: number;
}

export const DailyTotals: React.FC<DailyTotalsProps> = ({
  products,
  productTotalsMap,
  grandTotalQuantity,
  grandTotalAmount,
}) => {
  return (
    <tr className="bg-indigo-900 text-white font-extrabold sticky bottom-0 z-20 shadow-inner">
      {/* Sticky TOTAL label column */}
      <td className="px-4 py-3.5 sticky left-0 z-30 bg-indigo-950 text-white shadow-r border-r border-indigo-800 text-left text-sm uppercase tracking-wider">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>GRAND TOTAL</span>
        </div>
      </td>

      {/* Product Total Quantities */}
      {products.map((product) => {
        const totalQty = productTotalsMap[product.id] || 0;
        return (
          <td key={product.id} className="px-2 py-3.5 text-center border-r border-indigo-800/60 min-w-[80px]">
            <div className="text-sm font-black">{totalQty}</div>
            <div className="text-[10px] text-indigo-300 font-normal truncate">{product.name}</div>
          </td>
        );
      })}

      {/* Sticky Grand Total Qty */}
      <td className="px-4 py-3.5 text-center bg-indigo-950 border-r border-indigo-800 text-sm font-black text-amber-300">
        {grandTotalQuantity}
      </td>

      {/* Sticky Grand Total Amount */}
      <td className="px-4 py-3.5 text-right bg-indigo-950 text-base font-black text-emerald-300 sticky right-0 z-30 shadow-l">
        ₹{grandTotalAmount.toLocaleString('en-IN')}
      </td>
    </tr>
  );
};

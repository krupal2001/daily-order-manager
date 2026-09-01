import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatDisplayDate } from '../../services/calculationService';

export const PrintableOrderBook: React.FC = () => {
  const { products, shopkeepers, dailyEntries } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  const activeProducts = products.filter((p) => p.active);
  const activeShopkeepers = shopkeepers.filter((s) => s.active);

  // Today entries
  const todayEntries = dailyEntries.filter((e) => e.date === todayStr);

  const productTotals: Record<string, number> = {};
  activeProducts.forEach((p) => (productTotals[p.id] = 0));

  let grandTotalQty = 0;
  let grandTotalAmt = 0;

  return (
    <div className="print-only print-only-orderbook p-6 font-mono text-black">
      {/* Printable Header */}
      <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider">DAILY ORDER BOOK</h1>
          <p className="text-sm font-bold">PURCHASE & SALES LEDGER SHEET</p>
        </div>
        <div className="text-right">
          <p className="text-base font-black">DATE: {formatDisplayDate(todayStr)}</p>
          <p className="text-xs">Printed on: {new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Main Order Table */}
      <table className="w-full border-collapse border-2 border-black text-xs">
        <thead>
          <tr className="bg-slate-200 border-b-2 border-black uppercase font-black">
            <th className="border border-black p-2 text-left">Shopkeeper Name</th>
            {activeProducts.map((p) => (
              <th key={p.id} className="border border-black p-2 text-center">
                {p.name}
              </th>
            ))}
            <th className="border border-black p-2 text-center">Total Qty</th>
            <th className="border border-black p-2 text-right">Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {activeShopkeepers.map((sk) => {
            const entry = todayEntries.find((e) => e.shopkeeperId === sk.id);
            let rowQty = 0;
            let rowAmt = 0;

            if (entry) {
              rowQty = entry.totalQuantity || 0;
              rowAmt = entry.totalAmount || 0;
            }

            grandTotalQty += rowQty;
            grandTotalAmt += rowAmt;

            return (
              <tr key={sk.id} className="border-b border-black">
                <td className="border border-black p-2 font-bold">{sk.name}</td>
                {activeProducts.map((p) => {
                  const item = entry?.items.find((i) => i.productId === p.id);
                  const qty = item ? item.quantity : 0;
                  if (qty > 0) {
                    productTotals[p.id] = (productTotals[p.id] || 0) + qty;
                  }
                  return (
                    <td key={p.id} className="border border-black p-2 text-center font-bold">
                      {qty > 0 ? qty : '—'}
                    </td>
                  );
                })}
                <td className="border border-black p-2 text-center font-black">{rowQty || '0'}</td>
                <td className="border border-black p-2 text-right font-black">
                  ₹{rowAmt.toLocaleString('en-IN')}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-slate-200 border-t-2 border-black font-black uppercase text-sm">
            <td className="border border-black p-2">TOTAL</td>
            {activeProducts.map((p) => (
              <td key={p.id} className="border border-black p-2 text-center">
                {productTotals[p.id] || 0}
              </td>
            ))}
            <td className="border border-black p-2 text-center">{grandTotalQty}</td>
            <td className="border border-black p-2 text-right">
              ₹{grandTotalAmt.toLocaleString('en-IN')}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Footer / Notes */}
      <div className="mt-8 pt-4 border-t border-black flex justify-between items-end text-xs">
        <div>
          <p className="font-bold">Notes / Remarks:</p>
          <div className="w-96 border-b border-dashed border-black mt-4"></div>
          <div className="w-96 border-b border-dashed border-black mt-4"></div>
        </div>
        <div className="text-center font-bold">
          <div className="w-48 border-b border-black mb-1"></div>
          <span>Authorized Signature</span>
        </div>
      </div>
    </div>
  );
};

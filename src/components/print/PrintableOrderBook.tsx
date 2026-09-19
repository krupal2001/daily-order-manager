import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatDisplayDate } from '../../services/calculationService';

export const PrintableOrderBook: React.FC = () => {
  const { products, shopkeepers, dailyEntries, settings } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  const activeProducts = products.filter((p) => p.active);
  const activeShopkeepers = shopkeepers.filter((s) => s.active);

  // Today entries
  const todayEntries = dailyEntries.filter((e) => e.date === todayStr);

  const productTotals: Record<string, number> = {};
  activeProducts.forEach((p) => (productTotals[p.id] = 0));

  let grandTotalQty = 0;
  let grandTotalAmt = 0;

  const is58mm = (settings.printerPaperSize || '58mm') === '58mm';

  if (is58mm) {
    return (
      <div className="print-only print-only-orderbook font-mono text-black text-[11px] leading-tight max-w-[280px] mx-auto select-none">
        {/* Header */}
        <div className="text-center pb-2 border-b border-dashed border-black">
          <h1 className="text-sm font-black uppercase tracking-tight">DAILY ORDER BOOK</h1>
          <p className="text-[10px] font-bold">DAILY SUMMARY LEDGER</p>
          <p className="text-[10px]">Date: {formatDisplayDate(todayStr)}</p>
        </div>

        {/* Shopkeeper Breakdown */}
        <div className="py-2 border-b border-dashed border-black space-y-2">
          {activeShopkeepers.map((sk) => {
            const entry = todayEntries.find((e) => e.shopkeeperId === sk.id);
            if (!entry || (entry.totalQuantity === 0 && (!entry.items || entry.items.length === 0))) {
              return null;
            }

            grandTotalQty += entry.totalQuantity || 0;
            grandTotalAmt += entry.totalAmount || 0;

            return (
              <div key={sk.id} className="border-b border-dotted border-black pb-1.5 text-[10px]">
                <div className="font-bold uppercase text-xs flex justify-between">
                  <span>{sk.name}</span>
                  <span>₹{entry.totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="pl-1 text-[9px] space-y-0.5 mt-0.5">
                  {entry.items.map((item) => {
                    const prod = activeProducts.find((p) => p.id === item.productId);
                    if (!prod || item.quantity <= 0) return null;
                    productTotals[prod.id] = (productTotals[prod.id] || 0) + item.quantity;
                    return (
                      <div key={item.productId} className="flex justify-between">
                        <span>{prod.name}</span>
                        <span>{item.quantity} x ₹{item.price} = ₹{item.quantity * item.price}</span>
                      </div>
                    );
                  })}
                  {entry.adjustment && entry.adjustment !== 0 ? (
                    <div className="flex justify-between font-semibold">
                      <span>Adj:</span>
                      <span>{entry.adjustment > 0 ? '+' : ''}₹{entry.adjustment}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* Product Totals */}
        <div className="py-2 border-b border-dashed border-black text-[10px]">
          <div className="font-bold uppercase border-b border-black pb-1 mb-1">TOTAL PRODUCT QTY</div>
          {activeProducts.map((p) => {
            const total = productTotals[p.id] || 0;
            if (total === 0) return null;
            return (
              <div key={p.id} className="flex justify-between">
                <span>{p.name}:</span>
                <span className="font-bold">{total} {p.unit}s</span>
              </div>
            );
          })}
        </div>

        {/* Grand Total */}
        <div className="py-2 border-b-2 border-black text-center text-xs space-y-0.5">
          <div className="flex justify-between font-bold">
            <span>TOTAL QTY:</span>
            <span>{grandTotalQty}</span>
          </div>
          <div className="flex justify-between font-black text-sm pt-1 border-t border-black">
            <span>GRAND TOTAL:</span>
            <span>₹{grandTotalAmt.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 text-center text-[8px]">
          <p>Printed: {new Date().toLocaleTimeString()}</p>
          <div className="pt-3 border-t border-dotted border-black flex justify-between mt-2">
            <span>Prepared By</span>
            <span>Auth. Sign</span>
          </div>
        </div>
      </div>
    );
  }

  // Standard A4 Layout
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

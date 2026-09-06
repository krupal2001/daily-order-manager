import React, { useEffect } from 'react';
import { Shopkeeper, Product, AppSettings } from '../../types';
import { formatDisplayDate } from '../../services/calculationService';
import { Printer, X, Store, Phone, MapPin, Calendar, Clock } from 'lucide-react';

interface PrintableShopkeeperBillProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  shopkeeper: Shopkeeper;
  items: { productId: string; quantity: number; price: number }[];
  adjustment?: number;
  products: Product[];
  settings: AppSettings;
}

export const PrintableShopkeeperBill: React.FC<PrintableShopkeeperBillProps> = ({
  isOpen,
  onClose,
  date,
  shopkeeper,
  items,
  adjustment = 0,
  products,
  settings,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('printing-bill');
    } else {
      document.body.classList.remove('printing-bill');
    }
    return () => {
      document.body.classList.remove('printing-bill');
    };
  }, [isOpen]);

  if (!isOpen || !shopkeeper) return null;

  // Filter items with quantity > 0
  const activeItems = items.filter((item) => item.quantity > 0);

  // Compute bill totals
  let subtotalAmount = 0;
  let totalQuantity = 0;

  const lineItems = activeItems.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    const amount = item.quantity * item.price;
    subtotalAmount += amount;
    totalQuantity += item.quantity;
    return {
      productId: item.productId,
      name: product ? product.name : 'Unknown Product',
      unit: product ? product.unit : 'unit',
      quantity: item.quantity,
      rate: item.price,
      amount,
    };
  });

  const adjVal = Number(adjustment) || 0;
  const netTotalAmount = subtotalAmount + adjVal;

  const billNumber = `BILL-${date.replace(/-/g, '')}-${shopkeeper.id.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase()}`;
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto bill-modal-overlay">
      {/* Modal Container */}
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] bill-modal-card">
        {/* On-screen Modal Header (Hidden during browser print) */}
        <div className="no-print p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Print Shopkeeper Bill</h3>
              <p className="text-xs text-slate-400">Order invoice preview for {shopkeeper.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-extrabold shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Bill</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Bill Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-white text-slate-900 print-bill-container font-sans">
          {/* Bill Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-4 text-center sm:text-left flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                {settings.currencyCode === 'INR' ? 'DAILY ORDER MANAGER' : 'DAILY ORDER MANAGER'}
              </h1>
              <p className="text-xs font-extrabold text-slate-600 uppercase tracking-wider mt-0.5">
                DELIVERY ORDER BILL & RECEIPT
              </p>
            </div>

            <div className="text-left sm:text-right text-xs font-semibold text-slate-600 space-y-1">
              <div className="inline-block px-2.5 py-1 bg-slate-100 rounded-md font-mono text-slate-900 font-bold border border-slate-300">
                {billNumber}
              </div>
              <div className="flex items-center sm:justify-end gap-1 text-slate-700 mt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Date: <strong>{formatDisplayDate(date)}</strong></span>
              </div>
              <div className="flex items-center sm:justify-end gap-1 text-slate-700">
                <Clock className="w-3.5 h-3.5" />
                <span>Time: <strong>{currentTime}</strong></span>
              </div>
            </div>
          </div>

          {/* Shopkeeper Details Box */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-0.5">
                Billed To (Shopkeeper)
              </span>
              <p className="text-base font-black text-slate-900 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-indigo-600" />
                {shopkeeper.name}
              </p>
              {shopkeeper.address && (
                <p className="text-slate-600 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {shopkeeper.address}
                </p>
              )}
            </div>

            <div className="sm:text-right">
              {shopkeeper.phone && (
                <p className="text-slate-700 font-bold flex items-center sm:justify-end gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {shopkeeper.phone}
                </p>
              )}
              <p className="text-slate-500 font-medium mt-1">
                Total Items Ordered: <strong className="text-slate-900">{lineItems.length} Products ({totalQuantity} Qty)</strong>
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          {lineItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl text-xs font-semibold">
              No product items ordered for this shopkeeper on selected date.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-900 mb-4">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-extrabold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 border-b border-slate-900">Product Name</th>
                    <th className="py-3 px-3 text-center border-b border-slate-900">Qty</th>
                    <th className="py-3 px-4 text-right border-b border-slate-900">Rate</th>
                    <th className="py-3 px-4 text-right border-b border-slate-900">Amount</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 font-semibold text-slate-800">
                  {lineItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        {item.name}
                        <span className="text-[10px] text-slate-400 font-normal block">Per {item.unit}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-900">{item.quantity}</td>
                      <td className="py-2.5 px-4 text-right font-bold">₹{item.rate}</td>
                      <td className="py-2.5 px-4 text-right font-black text-slate-900">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot>
                  <tr className="bg-slate-100 font-black border-t-2 border-slate-900">
                    <td className="py-3 px-4 uppercase text-slate-900">
                      Total Quantity
                    </td>
                    <td className="py-3 px-3 text-center text-indigo-700 text-sm font-black">
                      {totalQuantity}
                    </td>
                    <td className="py-3 px-4 text-right uppercase text-slate-700">
                      Items Subtotal
                    </td>
                    <td className="py-3 px-4 text-right text-slate-900 text-sm font-black">
                      ₹{subtotalAmount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Bill Summary & Amount Calculation */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-t border-slate-200 pt-4">
            <div className="text-xs text-slate-500 space-y-1 sm:max-w-xs">
            </div>

            <div className="w-full sm:w-64 bg-slate-900 text-white rounded-2xl p-4 space-y-2 text-xs shadow-md">
              <div className="flex justify-between items-center text-slate-300 font-medium">
                <span>Subtotal Amount:</span>
                <span className="font-bold">₹{subtotalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300 font-medium">
                <span>Adjustment ({adjVal >= 0 ? '+' : ''}):</span>
                <span className={`font-bold ${adjVal > 0 ? 'text-emerald-400' : (adjVal < 0 ? 'text-rose-400' : 'text-slate-400')}`}>
                  {adjVal > 0 ? '+' : ''}₹{adjVal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="border-t border-slate-700 pt-2 flex justify-between items-center text-sm font-black text-white">
                <span>NET TOTAL AMOUNT:</span>
                <span className="text-emerald-400 text-base">₹{netTotalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="mt-6 pt-4 border-t border-dashed border-slate-300 flex justify-between items-end text-xs">
            <div className="text-center">
              <div className="w-36 border-b border-slate-400 mb-1"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Shopkeeper Signature</span>
            </div>
            <div className="text-center">
              <div className="w-44 border-b border-slate-900 mb-1"></div>
              <span className="text-[10px] font-bold text-slate-900 uppercase">Authorized Delivery Signature</span>
            </div>
          </div>
        </div>

        {/* On-screen Modal Footer (Hidden during browser print) */}
        <div className="no-print p-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            Press Print Bill to open printer dialog
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Bill</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

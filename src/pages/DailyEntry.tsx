import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { DailyEntryTable } from '../components/daily-entry/DailyEntryTable';
import { MobileShopkeeperCard } from '../components/daily-entry/MobileShopkeeperCard';
import { PrintableShopkeeperBill } from '../components/print/PrintableShopkeeperBill';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { getEffectiveProductPrice, getPreviousDateStr, getNextDateStr } from '../services/calculationService';
import { exportDailyReportCSV, exportDailyReportPDF } from '../services/exportService';
import { Shopkeeper } from '../types';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Copy,
  Trash2,
  Save,
  Printer,
  Download,
  FileText,
  Search,
  Check,
  RefreshCw,
} from 'lucide-react';

export const DailyEntryPage: React.FC = () => {
  const {
    products,
    shopkeepers,
    priceMappings,
    dailyEntries,
    settings,
    saveFullDailyEntriesForDate,
    copyPreviousDay,
    clearDailyEntriesForDate,
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Local draft state for current date entry grid: shopkeeperId -> productId -> quantity
  const [draftEntriesMap, setDraftEntriesMap] = useState<Record<string, Record<string, number>>>({});
  const [draftAdjustmentsMap, setDraftAdjustmentsMap] = useState<Record<string, number>>({});
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  // Shopkeeper Bill Print State
  const [printShopkeeper, setPrintShopkeeper] = useState<Shopkeeper | null>(null);

  const activeProducts = useMemo(() => products.filter((p) => p.active), [products]);
  const activeShopkeepers = useMemo(() => shopkeepers.filter((s) => s.active), [shopkeepers]);

  // Compute resolved applicable prices map for every shopkeeper and product
  const pricesMap = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    activeShopkeepers.forEach((sk) => {
      map[sk.id] = {};
      activeProducts.forEach((prod) => {
        map[sk.id][prod.id] = getEffectiveProductPrice(prod.id, sk.id, priceMappings, products);
      });
    });
    return map;
  }, [activeShopkeepers, activeProducts, priceMappings, products]);

  // Load entries & adjustments for selected date into draft state
  useEffect(() => {
    const map: Record<string, Record<string, number>> = {};
    const adjMap: Record<string, number> = {};
    activeShopkeepers.forEach((sk) => {
      map[sk.id] = {};
      adjMap[sk.id] = 0;
      activeProducts.forEach((p) => {
        map[sk.id][p.id] = 0;
      });
    });

    const entriesForDate = dailyEntries.filter((e) => e.date === selectedDate);
    entriesForDate.forEach((entry) => {
      if (map[entry.shopkeeperId]) {
        entry.items.forEach((item) => {
          map[entry.shopkeeperId][item.productId] = item.quantity;
        });
        adjMap[entry.shopkeeperId] = entry.adjustment || 0;
      }
    });

    setDraftEntriesMap(map);
    setDraftAdjustmentsMap(adjMap);
    setSaveStatus('saved');
  }, [selectedDate, dailyEntries, activeShopkeepers, activeProducts]);

  // Handle cell quantity change
  const handleQuantityChange = useCallback(
    (shopkeeperId: string, productId: string, newQty: number) => {
      setDraftEntriesMap((prev) => {
        const skMap = { ...(prev[shopkeeperId] || {}) };
        skMap[productId] = newQty;
        return { ...prev, [shopkeeperId]: skMap };
      });
      setSaveStatus('unsaved');
    },
    []
  );

  // Handle adjustment change
  const handleAdjustmentChange = useCallback((shopkeeperId: string, newAdj: number) => {
    setDraftAdjustmentsMap((prev) => ({
      ...prev,
      [shopkeeperId]: newAdj,
    }));
    setSaveStatus('unsaved');
  }, []);

  // Explicit Save Day
  const handleSaveDay = () => {
    setSaveStatus('saving');
    saveFullDailyEntriesForDate(selectedDate, draftEntriesMap, draftAdjustmentsMap);
    setTimeout(() => {
      setSaveStatus('saved');
    }, 400);
  };

  // Confirm Copy Previous Day
  const handleConfirmCopyPreviousDay = () => {
    const success = copyPreviousDay(selectedDate);
    setIsCopyModalOpen(false);
    if (success) {
      setSaveStatus('saved');
    }
  };

  // Confirm Clear Day
  const handleConfirmClearDay = () => {
    clearDailyEntriesForDate(selectedDate);
    setIsClearModalOpen(false);
    setSaveStatus('saved');
  };

  // Filter shopkeepers by search query
  const filteredShopkeepers = useMemo(() => {
    if (!searchQuery.trim()) return activeShopkeepers;
    const query = searchQuery.toLowerCase();
    return activeShopkeepers.filter((s) => s.name.toLowerCase().includes(query));
  }, [activeShopkeepers, searchQuery]);

  // Total daily stats computation (including adjustments)
  const { totalQty, totalAmount, activeShopkeeperCount } = useMemo(() => {
    let qty = 0;
    let amt = 0;
    let count = 0;

    Object.entries(draftEntriesMap).forEach(([skId, pMap]) => {
      let skQty = 0;
      let skSubtotal = 0;
      Object.entries(pMap).forEach(([pId, q]) => {
        if (q > 0) {
          skQty += q;
          const price = pricesMap[skId]?.[pId] || 0;
          skSubtotal += q * price;
        }
      });
      const adj = draftAdjustmentsMap[skId] || 0;
      if (skQty > 0 || adj !== 0) {
        qty += skQty;
        amt += skSubtotal + adj;
        count++;
      }
    });

    return { totalQty: qty, totalAmount: amt, activeShopkeeperCount: count };
  }, [draftEntriesMap, draftAdjustmentsMap, pricesMap]);

  const isTodaySelected = selectedDate === todayStr;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Screen-Only Daily Entry View UI */}
      <div className="no-print space-y-6">
        {/* Top Date Navigation & Action Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Date Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedDate(getPreviousDateStr(selectedDate))}
              className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous Day</span>
            </button>

            <div className="flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-3.5 py-1.5 rounded-xl">
              <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="bg-transparent font-bold text-slate-900 dark:text-white text-sm outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={() => setSelectedDate(todayStr)}
              disabled={isTodaySelected}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                isTodaySelected
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
              }`}
            >
              Today
            </button>

            <button
              onClick={() => setSelectedDate(getNextDateStr(selectedDate))}
              disabled={selectedDate >= todayStr}
              className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span className="hidden sm:inline">Next Day</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Autosave & Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Indicator */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
              {saveStatus === 'saved' && (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">Saved ✓</span>
                </>
              )}
              {saveStatus === 'saving' && (
                <>
                  <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">Saving...</span>
                </>
              )}
              {saveStatus === 'unsaved' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">Unsaved changes</span>
                </>
              )}
            </div>

            <button
              onClick={() => setIsCopyModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Previous Day</span>
            </button>

            <button
              onClick={() => setIsClearModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Day</span>
            </button>

            <button
              onClick={() => exportDailyReportCSV(selectedDate, dailyEntries, shopkeepers, products)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 text-xs font-bold transition-colors"
              title="Export CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CSV</span>
            </button>

            <button
              onClick={() => exportDailyReportPDF(selectedDate, dailyEntries, shopkeepers, products)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
              title="Download PDF Order Book"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF Record</span>
            </button>

            <button
              onClick={() => window.print()}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
              title="Print Order Book"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={handleSaveDay}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-indigo-200 dark:shadow-none hover:from-indigo-700 hover:to-violet-700 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Day</span>
            </button>
          </div>
        </div>

        {/* Summary KPI Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Date Selected</p>
            <p className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
              {selectedDate}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Active Shopkeepers</p>
            <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
              {activeShopkeeperCount} / {activeShopkeepers.length}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Total Quantity</p>
            <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
              {totalQty}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Total Amount</p>
            <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              ₹{totalAmount.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Search Shopkeeper Bar */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2.5 flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search shopkeeper..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-white outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold px-1"
              >
                Clear
              </button>
            )}
          </div>
          <div className="text-xs font-semibold text-slate-500 hidden sm:block">
            Showing {filteredShopkeepers.length} Shopkeepers • {activeProducts.length} Products
          </div>
        </div>

        {/* Main Grid View */}
        {/* Desktop Spreadsheet View */}
        <div className="hidden md:block">
          <DailyEntryTable
            shopkeepers={filteredShopkeepers}
            products={activeProducts}
            entriesMap={draftEntriesMap}
            adjustmentsMap={draftAdjustmentsMap}
            pricesMap={pricesMap}
            onQuantityChange={handleQuantityChange}
            onAdjustmentChange={handleAdjustmentChange}
            onPrintBill={(sk) => setPrintShopkeeper(sk)}
          />
        </div>

        {/* Mobile Expandable Cards View */}
        <div className="md:hidden space-y-3 pb-20">
          {filteredShopkeepers.map((sk) => (
            <MobileShopkeeperCard
              key={sk.id}
              shopkeeper={sk}
              products={activeProducts}
              quantitiesMap={draftEntriesMap[sk.id] || {}}
              pricesMap={pricesMap[sk.id] || {}}
              adjustmentVal={draftAdjustmentsMap[sk.id] || 0}
              onQuantityChange={(prodId, newQty) => handleQuantityChange(sk.id, prodId, newQty)}
              onAdjustmentChange={(newAdj) => handleAdjustmentChange(sk.id, newAdj)}
              onPrintBill={(skItem) => setPrintShopkeeper(skItem)}
            />
          ))}
        </div>

        {/* Mobile Sticky Grand Totals Summary Bar */}
        <div className="md:hidden fixed bottom-14 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md text-white px-4 py-2.5 shadow-2xl border-t border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Day Grand Total</span>
            <div className="flex items-center space-x-3 text-xs font-bold mt-0.5">
              <span>Total Qty: <strong className="text-amber-400 font-extrabold">{totalQty}</strong></span>
              <span>Total Amt: <strong className="text-emerald-400 font-extrabold">₹{totalAmount.toLocaleString('en-IN')}</strong></span>
            </div>
          </div>

          <button
            onClick={handleSaveDay}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-extrabold shadow-md active:scale-95 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Day</span>
          </button>
        </div>

        {/* Confirmation Modals */}
        <ConfirmModal
          isOpen={isCopyModalOpen}
          title="Copy Previous Day Entries?"
          message={`This will overwrite the current draft for ${selectedDate} with quantities from ${getPreviousDateStr(
            selectedDate
          )}. Applicable shopkeeper prices for today will be automatically calculated.`}
          confirmText="Copy Entries"
          cancelText="Cancel"
          variant="warning"
          onConfirm={handleConfirmCopyPreviousDay}
          onCancel={() => setIsCopyModalOpen(false)}
        />

        <ConfirmModal
          isOpen={isClearModalOpen}
          title="Clear All Entries for Selected Date?"
          message={`Are you sure you want to clear all product quantities entered for ${selectedDate}? This action cannot be undone.`}
          confirmText="Clear Entries"
          cancelText="Cancel"
          variant="danger"
          onConfirm={handleConfirmClearDay}
          onCancel={() => setIsClearModalOpen(false)}
        />
      </div>

      {/* Printable Shopkeeper Bill Modal */}
      {printShopkeeper && (
        <PrintableShopkeeperBill
          isOpen={!!printShopkeeper}
          onClose={() => setPrintShopkeeper(null)}
          date={selectedDate}
          shopkeeper={printShopkeeper}
          items={Object.entries(draftEntriesMap[printShopkeeper.id] || {}).map(([productId, quantity]) => ({
            productId,
            quantity,
            price: pricesMap[printShopkeeper.id]?.[productId] || 0,
          }))}
          products={activeProducts}
          settings={settings}
        />
      )}
    </div>
  );
};

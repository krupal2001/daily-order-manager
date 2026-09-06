import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DailyEntry } from '../types';
import { formatDisplayDate } from '../services/calculationService';
import { exportDailyReportCSV, exportDailyReportPDF } from '../services/exportService';
import { ConfirmModal } from '../components/common/ConfirmModal';
import {
  History,
  Search,
  Calendar,
  Eye,
  Trash2,
  Download,
  Printer,
  X,
  FileText,
} from 'lucide-react';

export const DailyRecordsPage: React.FC = () => {
  const { dailyEntries, shopkeepers, products, clearDailyEntriesForDate } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkFilter, setSelectedSkFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Selected date order-book view modal
  const [viewDateModal, setViewDateModal] = useState<string | null>(null);

  // Delete modal state
  const [deleteDateTarget, setDeleteDateTarget] = useState<string | null>(null);

  // Group entries by date
  const dateWiseSummaries = useMemo(() => {
    const map: Record<
      string,
      { date: string; totalEntries: number; totalQty: number; totalAmount: number; entries: DailyEntry[] }
    > = {};

    dailyEntries.forEach((entry) => {
      if (!map[entry.date]) {
        map[entry.date] = {
          date: entry.date,
          totalEntries: 0,
          totalQty: 0,
          totalAmount: 0,
          entries: [],
        };
      }
      map[entry.date].totalEntries++;
      map[entry.date].totalQty += entry.totalQuantity || 0;
      map[entry.date].totalAmount += entry.totalAmount || 0;
      map[entry.date].entries.push(entry);
    });

    return Object.values(map).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [dailyEntries]);

  // Filtered entries for table
  const filteredDailyEntries = useMemo(() => {
    return dailyEntries.filter((entry) => {
      const sk = shopkeepers.find((s) => s.id === entry.shopkeeperId);
      const matchesSearch =
        sk?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.date.includes(searchQuery);
      const matchesSk = selectedSkFilter === 'all' || entry.shopkeeperId === selectedSkFilter;

      let matchesDate = true;
      if (dateFrom && entry.date < dateFrom) matchesDate = false;
      if (dateTo && entry.date > dateTo) matchesDate = false;

      return matchesSearch && matchesSk && matchesDate;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [dailyEntries, shopkeepers, searchQuery, selectedSkFilter, dateFrom, dateTo]);

  // Selected date modal summary data
  const dateModalData = useMemo(() => {
    if (!viewDateModal) return null;
    const entriesForDate = dailyEntries.filter((e) => e.date === viewDateModal);
    let totalQty = 0;
    let totalAmount = 0;
    entriesForDate.forEach((e) => {
      totalQty += e.totalQuantity || 0;
      totalAmount += e.totalAmount || 0;
    });

    return {
      date: viewDateModal,
      totalShopkeepers: entriesForDate.length,
      totalQty,
      totalAmount,
      entries: entriesForDate,
    };
  }, [viewDateModal, dailyEntries]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-600" />
            Daily Order Records
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Historical log of daily shopkeeper entries and order books. Preserves actual transaction prices recorded at time of sale.
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search shopkeeper or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-white outline-none"
            />
          </div>

          {/* Shopkeeper Filter */}
          <div>
            <select
              value={selectedSkFilter}
              onChange={(e) => setSelectedSkFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white outline-none"
            >
              <option value="all">All Shopkeepers</option>
              {shopkeepers.map((sk) => (
                <option key={sk.id} value={sk.id}>
                  {sk.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <Calendar className="w-4 h-4 text-slate-400" />
            <div className="flex-1">
              <span className="block text-[10px] font-bold uppercase text-slate-400">Date From</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Date To */}
          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <Calendar className="w-4 h-4 text-slate-400" />
            <div className="flex-1">
              <span className="block text-[10px] font-bold uppercase text-slate-400">Date To</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>
        </div>

        {(searchQuery || selectedSkFilter !== 'all' || dateFrom || dateTo) && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSkFilter('all');
                setDateFrom('');
                setDateTo('');
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Grouped Date Summary Cards */}
      <div className="space-y-3">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
          Date-Wise Order Book Logs
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dateWiseSummaries.map((ds) => (
            <div
              key={ds.date}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-indigo-400 transition-all cursor-pointer"
              onClick={() => setViewDateModal(ds.date)}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {formatDisplayDate(ds.date)}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    {ds.totalEntries} Shopkeepers
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total Qty</span>
                    <p className="text-lg font-black text-amber-600 dark:text-amber-400">{ds.totalQty}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total Amount</span>
                    <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      ₹{ds.totalAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-indigo-600">
                <span>View Full Order Book</span>
                <Eye className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Individual Entry Rows Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-5">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
          All Historical Transactions ({filteredDailyEntries.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900 text-white text-xs uppercase font-extrabold">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Shopkeeper Name</th>
                <th className="py-3.5 px-4 text-center">Items Purchased</th>
                <th className="py-3.5 px-4 text-center">Total Quantity</th>
                <th className="py-3.5 px-4 text-right">Total Amount</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
              {filteredDailyEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No historical daily entries found.
                  </td>
                </tr>
              ) : (
                filteredDailyEntries.map((entry) => {
                  const sk = shopkeepers.find((s) => s.id === entry.shopkeeperId);
                  return (
                    <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {formatDisplayDate(entry.date)}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-indigo-600">
                        {sk ? sk.name : 'Unknown Shopkeeper'}
                      </td>

                      <td className="py-3.5 px-4 text-center text-xs text-slate-500">
                        {entry.items.map((i) => {
                          const prod = products.find((p) => p.id === i.productId);
                          return prod ? `${prod.name}: ${i.quantity}` : '';
                        }).filter(Boolean).join(', ')}
                      </td>

                      <td className="py-3.5 px-4 text-center font-black text-amber-600">
                        {entry.totalQuantity}
                      </td>

                      <td className="py-3.5 px-4 text-right font-black text-emerald-600">
                        ₹{entry.totalAmount.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4 text-center space-x-1">
                        <button
                          onClick={() => setViewDateModal(entry.date)}
                          className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50"
                          title="View Date Order Book"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteDateTarget(entry.date)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                          title="Clear Day Entries"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Date Order-Book Detailed Modal */}
      {dateModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Order Book: {formatDisplayDate(dateModalData.date)}
                </h3>
                <p className="text-xs text-slate-500">Digitized paper order book layout view</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => exportDailyReportPDF(dateModalData.date, dailyEntries, shopkeepers, products)}
                  className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold text-xs hover:bg-rose-100"
                  title="Download PDF"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => exportDailyReportCSV(dateModalData.date, dailyEntries, shopkeepers, products)}
                  className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                  title="Export CSV"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                  title="Print Order Book"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewDateModal(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Date Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Shopkeepers</span>
                <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  {dateModalData.totalShopkeepers}
                </p>
              </div>
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-100 dark:border-amber-900 text-center">
                <span className="text-[10px] font-bold text-amber-600 uppercase">Total Qty</span>
                <p className="text-lg font-black text-amber-700 dark:text-amber-400 mt-0.5">
                  {dateModalData.totalQty}
                </p>
              </div>
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-900 text-center">
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Total Amount</span>
                <p className="text-lg font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                  ₹{dateModalData.totalAmount.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Product breakdown table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 max-h-96">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs uppercase font-extrabold sticky top-0">
                    <th className="py-3 px-4">Shopkeeper Name</th>
                    {products.filter((p) => p.active).map((p) => (
                      <th key={p.id} className="py-3 px-2 text-center">
                        {p.name}
                      </th>
                    ))}
                    <th className="py-3 px-3 text-center text-amber-400">Total Qty</th>
                    <th className="py-3 px-3 text-center text-indigo-400">Adjustment</th>
                    <th className="py-3 px-4 text-right text-emerald-400">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                  {dateModalData.entries.map((entry) => {
                    const sk = shopkeepers.find((s) => s.id === entry.shopkeeperId);
                    return (
                      <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                        <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">
                          {sk ? sk.name : 'Unknown'}
                        </td>
                        {products.filter((p) => p.active).map((p) => {
                          const item = entry.items.find((i) => i.productId === p.id);
                          return (
                            <td key={p.id} className="py-2.5 px-2 text-center text-slate-600">
                              {item && item.quantity > 0 ? (
                                <span className="font-extrabold text-indigo-600">{item.quantity}</span>
                              ) : (
                                '—'
                              )}
                            </td>
                          );
                        })}
                        <td className="py-2.5 px-3 text-center font-extrabold text-slate-900">
                          {entry.totalQuantity}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-xs">
                          {entry.adjustment && entry.adjustment !== 0 ? (
                            <span className={entry.adjustment > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                              {entry.adjustment > 0 ? '+' : ''}₹{entry.adjustment}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right font-black text-emerald-600">
                          ₹{entry.totalAmount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteDateTarget}
        title="Delete All Entries for Date?"
        message={`Are you sure you want to delete all recorded daily purchase entries for ${deleteDateTarget}?`}
        confirmText="Delete Entries"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          if (deleteDateTarget) {
            clearDailyEntriesForDate(deleteDateTarget);
            setDeleteDateTarget(null);
          }
        }}
        onCancel={() => setDeleteDateTarget(null)}
      />
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  exportToCSV,
  exportDailyReportCSV,
  exportDailyReportPDF,
  exportProductReportPDF,
  exportShopkeeperReportPDF,
} from '../services/exportService';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Package,
  Users,
  TrendingUp,
  PieChart as PieChartIcon,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const { products, shopkeepers, dailyEntries } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<'product' | 'shopkeeper' | 'daily' | 'range'>('product');

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [rangeFrom, setRangeFrom] = useState<string>('');
  const [rangeTo, setRangeTo] = useState<string>('');

  // 1. Product Summary Report Data
  const productReportData = useMemo(() => {
    const map: Record<string, { id: string; name: string; unit: string; totalQty: number; totalAmount: number }> = {};

    products.forEach((p) => {
      map[p.id] = { id: p.id, name: p.name, unit: p.unit, totalQty: 0, totalAmount: 0 };
    });

    dailyEntries.forEach((entry) => {
      // Filter date range if set
      if (rangeFrom && entry.date < rangeFrom) return;
      if (rangeTo && entry.date > rangeTo) return;

      entry.items.forEach((item) => {
        if (map[item.productId]) {
          map[item.productId].totalQty += item.quantity || 0;
          map[item.productId].totalAmount += (item.quantity || 0) * (item.price || 0);
        }
      });
    });

    return Object.values(map).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [products, dailyEntries, rangeFrom, rangeTo]);

  // 2. Shopkeeper Summary Report Data
  const shopkeeperReportData = useMemo(() => {
    const map: Record<string, { id: string; name: string; orderCount: number; totalQty: number; totalAmount: number }> = {};

    shopkeepers.forEach((s) => {
      map[s.id] = { id: s.id, name: s.name, orderCount: 0, totalQty: 0, totalAmount: 0 };
    });

    dailyEntries.forEach((entry) => {
      if (rangeFrom && entry.date < rangeFrom) return;
      if (rangeTo && entry.date > rangeTo) return;

      if (map[entry.shopkeeperId]) {
        map[entry.shopkeeperId].orderCount += 1;
        map[entry.shopkeeperId].totalQty += entry.totalQuantity || 0;
        map[entry.shopkeeperId].totalAmount += entry.totalAmount || 0;
      }
    });

    return Object.values(map).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [shopkeepers, dailyEntries, rangeFrom, rangeTo]);

  // CSV Exporter for Product Report
  const handleExportProductCSV = () => {
    const headers = ['Product Name', 'Unit', 'Total Quantity Sold', 'Total Revenue (₹)'];
    const rows = productReportData.map((p) => [p.name, p.unit, p.totalQty, p.totalAmount]);
    exportToCSV(`Product_Report_${todayStr}.csv`, [headers, ...rows]);
  };

  // CSV Exporter for Shopkeeper Report
  const handleExportShopkeeperCSV = () => {
    const headers = ['Shopkeeper Name', 'Total Orders', 'Total Quantity Purchased', 'Total Amount (₹)'];
    const rows = shopkeeperReportData.map((s) => [s.name, s.orderCount, s.totalQty, s.totalAmount]);
    exportToCSV(`Shopkeeper_Report_${todayStr}.csv`, [headers, ...rows]);
  };

  const COLORS = ['#4f46e5', '#7c3aed', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#06b6d4', '#84cc16'];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            Analytics & Reports
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Detailed sales reports, product performance metrics, shopkeeper analytics, and exportable ledgers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Inputs */}
          <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={rangeFrom}
              onChange={(e) => setRangeFrom(e.target.value)}
              className="bg-transparent outline-none text-slate-700 dark:text-slate-200"
              title="Filter From Date"
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              value={rangeTo}
              onChange={(e) => setRangeTo(e.target.value)}
              className="bg-transparent outline-none text-slate-700 dark:text-slate-200"
              title="Filter To Date"
            />
          </div>

          <button
            onClick={() => exportDailyReportCSV(selectedDate, dailyEntries, shopkeepers, products)}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print Order Book</span>
          </button>
        </div>
      </div>

      {/* Report Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveReportTab('product')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
            activeReportTab === 'product'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Product Report</span>
        </button>

        <button
          onClick={() => setActiveReportTab('shopkeeper')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
            activeReportTab === 'shopkeeper'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Shopkeeper Report</span>
        </button>

        <button
          onClick={() => setActiveReportTab('daily')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
            activeReportTab === 'daily'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Daily Report</span>
        </button>
      </div>

      {/* 1. PRODUCT REPORT TAB */}
      {activeReportTab === 'product' && (
        <div className="space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quantity Bar Chart */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Product Quantity Distribution
              </h3>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productReportData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(val: any) => [`${val} Units`, 'Quantity']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="totalQty" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue Pie Chart */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-emerald-600" />
                Product Revenue Share (₹)
              </h3>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productReportData.filter((p) => p.totalAmount > 0)}
                      dataKey="totalAmount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }: { name?: string; percent?: number }) =>
                        `${name || ''} ${(((percent || 0) * 100)).toFixed(0)}%`
                      }
                    >
                      {productReportData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: any) => [`₹${val}`, 'Revenue']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Product Report Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Product Sales Summary Table
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => exportProductReportPDF(productReportData)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-extrabold text-xs hover:bg-rose-100"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={handleExportProductCSV}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-xs hover:bg-slate-200"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs uppercase font-extrabold">
                    <th className="py-3.5 px-5">Product Name</th>
                    <th className="py-3.5 px-4 text-center">Unit</th>
                    <th className="py-3.5 px-4 text-center">Total Quantity Sold</th>
                    <th className="py-3.5 px-5 text-right">Total Revenue Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                  {productReportData.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white">{p.name}</td>
                      <td className="py-3.5 px-4 text-center text-slate-500 uppercase text-xs">{p.unit}</td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-amber-600">{p.totalQty}</td>
                      <td className="py-3.5 px-5 text-right font-black text-emerald-600">
                        ₹{p.totalAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. SHOPKEEPER REPORT TAB */}
      {activeReportTab === 'shopkeeper' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Top Purchasing Shopkeepers (Total Amount ₹)
            </h3>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shopkeeperReportData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any) => [`₹${val}`, 'Total Amount']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="totalAmount" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Shopkeeper Purchase Performance Ledger
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => exportShopkeeperReportPDF(shopkeeperReportData)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-extrabold text-xs hover:bg-rose-100"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={handleExportShopkeeperCSV}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-xs hover:bg-slate-200"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs uppercase font-extrabold">
                    <th className="py-3.5 px-5">Shopkeeper Name</th>
                    <th className="py-3.5 px-4 text-center">Total Orders Recorded</th>
                    <th className="py-3.5 px-4 text-center">Total Items Purchased</th>
                    <th className="py-3.5 px-5 text-right">Total Purchase Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                  {shopkeeperReportData.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white">{s.name}</td>
                      <td className="py-3.5 px-4 text-center text-slate-600">{s.orderCount}</td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-amber-600">{s.totalQty}</td>
                      <td className="py-3.5 px-5 text-right font-black text-emerald-600">
                        ₹{s.totalAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. DAILY REPORT TAB */}
      {activeReportTab === 'daily' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Daily Order Book Printable Report
              </h3>
              <p className="text-xs text-slate-500">Select date to generate order book layout</p>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold outline-none"
              />

              <button
                onClick={() => exportDailyReportPDF(selectedDate, dailyEntries, shopkeepers, products)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
              >
                <FileText className="w-4 h-4" />
                <span>Download PDF Record</span>
              </button>

              <button
                onClick={() => exportDailyReportCSV(selectedDate, dailyEntries, shopkeepers, products)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200"
              >
                Download CSV
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Click <strong>"Print Order Book"</strong> at the top to print a clean A4 landscape physical paper order book template.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

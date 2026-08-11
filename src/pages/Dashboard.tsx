import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getDailySummaryForDate, formatDisplayDate } from '../services/calculationService';
import {
  ShoppingBag,
  IndianRupee,
  Users,
  Package,
  UserCheck,
  CalendarPlus,
  ArrowRight,
  TrendingUp,
  BarChart,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { products, shopkeepers, dailyEntries } = useApp();
  const navigate = useNavigate();

  const todayStr = new Date().toISOString().split('T')[0];

  // Today's summary computation
  const todaySummary = useMemo(
    () => getDailySummaryForDate(todayStr, dailyEntries, shopkeepers, products),
    [todayStr, dailyEntries, shopkeepers, products]
  );

  // Recent 8 daily entries list
  const recentEntries = useMemo(() => {
    return [...dailyEntries]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 8);
  }, [dailyEntries]);

  // Chart data: Last 7 days total amount trend
  const weeklyTrendData = useMemo(() => {
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    return dates.map((dateStr) => {
      const summary = getDailySummaryForDate(dateStr, dailyEntries, shopkeepers, products);
      return {
        date: dateStr.split('-').slice(1).join('/'),
        amount: summary.totalAmount,
        quantity: summary.totalQuantity,
      };
    });
  }, [dailyEntries, shopkeepers, products]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-500/30 border border-indigo-400/40 text-indigo-200">
            Daily Order Management System
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Today's Order Overview
          </h1>
          <p className="text-sm text-indigo-200 font-medium max-w-lg">
            Record, track, and analyze daily shopkeeper purchases with instant price calculation and automatic local browser persistence.
          </p>
        </div>

        <button
          onClick={() => navigate('/daily-entry')}
          className="relative z-10 flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-white text-indigo-900 font-extrabold text-sm shadow-lg hover:bg-indigo-50 transition-all active:scale-95 shrink-0"
        >
          <CalendarPlus className="w-5 h-5 text-indigo-600" />
          <span>Open Daily Entry</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Today's Total Quantity */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase">Today's Qty</span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {todaySummary.totalQuantity}
            </h3>
            <p className="text-xs font-semibold text-slate-400 mt-1">Total items ordered</p>
          </div>
        </div>

        {/* Today's Total Amount */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase">Today's Amount</span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              ₹{todaySummary.totalAmount.toLocaleString('en-IN')}
            </h3>
            <p className="text-xs font-semibold text-slate-400 mt-1">Revenue for today</p>
          </div>
        </div>

        {/* Total Shopkeepers */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase">Shopkeepers</span>
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {shopkeepers.filter((s) => s.active).length}
            </h3>
            <p className="text-xs font-semibold text-slate-400 mt-1">Master shopkeeper count</p>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase">Products</span>
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {products.filter((p) => p.active).length}
            </h3>
            <p className="text-xs font-semibold text-slate-400 mt-1">Active product catalog</p>
          </div>
        </div>

        {/* Active Shopkeepers Today */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase">Active Today</span>
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
              {todaySummary.activeShopkeepers}
            </h3>
            <p className="text-xs font-semibold text-slate-400 mt-1">Shopkeepers ordered today</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts & Today's Product Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Product Summary Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                <BarChart className="w-5 h-5 text-indigo-600" />
                Today's Product Summary
              </h3>
              <p className="text-xs text-slate-500">Breakdown of items sold on {todayStr}</p>
            </div>
            <button
              onClick={() => navigate('/daily-entry')}
              className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800"
            >
              Manage Entry →
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-extrabold text-xs uppercase">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4 text-center">Quantity</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {todaySummary.productSummaries.map((item) => (
                  <tr key={item.productId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {item.productName}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                      <span className={item.quantity > 0 ? 'text-indigo-600 font-bold' : 'text-slate-400'}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900 dark:text-white">
                      <span className={item.amount > 0 ? 'text-emerald-600' : 'text-slate-400'}>
                        ₹{item.amount.toLocaleString('en-IN')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 7 Days Trend Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              7-Day Sales Trend
            </h3>
            <p className="text-xs text-slate-500">Revenue over past week</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`₹${val}`, 'Amount']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="amount" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Daily Entries */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
              Recent Daily Entries
            </h3>
            <p className="text-xs text-slate-500">Latest recorded purchases across dates</p>
          </div>
          <button
            onClick={() => navigate('/records')}
            className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800"
          >
            View All Records →
          </button>
        </div>

        {recentEntries.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No daily entries recorded yet. Click "Open Daily Entry" to record today's orders.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentEntries.map((entry) => {
              const shopkeeper = shopkeepers.find((s) => s.id === entry.shopkeeperId);
              return (
                <div
                  key={entry.id}
                  onClick={() => navigate('/records')}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer transition-all hover:shadow-md"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-bold text-indigo-600">{formatDisplayDate(entry.date)}</span>
                    <span>{entry.items.length} Items</span>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    {shopkeeper ? shopkeeper.name : 'Unknown Shopkeeper'}
                  </h4>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Qty</span>
                      <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                        {entry.totalQuantity}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Amount</span>
                      <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                        ₹{entry.totalAmount.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

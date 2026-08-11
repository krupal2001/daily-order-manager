import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getApplicablePrice, formatDisplayDate } from '../services/calculationService';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  IndianRupee,
  ChevronRight,
  Tag,
} from 'lucide-react';

export const ShopkeeperDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { shopkeepers, products, priceMappings, dailyEntries } = useApp();

  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month'>('all');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  const shopkeeper = shopkeepers.find((s) => s.id === id);

  const activeProducts = useMemo(() => products.filter((p) => p.active), [products]);

  // All entries for this shopkeeper
  const skEntries = useMemo(() => {
    if (!id) return [];
    return dailyEntries
      .filter((e) => e.shopkeeperId === id && e.totalQuantity > 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [id, dailyEntries]);

  // Date filtered entries
  const filteredEntries = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    const yestStr = yest.toISOString().split('T')[0];

    return skEntries.filter((e) => {
      if (dateFilter === 'today') return e.date === todayStr;
      if (dateFilter === 'yesterday') return e.date === yestStr;
      if (dateFilter === 'week') {
        const entryDate = new Date(e.date);
        const diffDays = (today.getTime() - entryDate.getTime()) / (1000 * 3600 * 24);
        return diffDays <= 7;
      }
      if (dateFilter === 'month') {
        const entryDate = new Date(e.date);
        return (
          entryDate.getMonth() === today.getMonth() &&
          entryDate.getFullYear() === today.getFullYear()
        );
      }
      return true;
    });
  }, [skEntries, dateFilter]);

  // Total summary calculation
  const totals = useMemo(() => {
    let qty = 0;
    let amt = 0;
    filteredEntries.forEach((e) => {
      qty += e.totalQuantity || 0;
      amt += e.totalAmount || 0;
    });
    return { qty, amt, count: filteredEntries.length };
  }, [filteredEntries]);

  if (!shopkeeper) {
    return (
      <div className="p-8 text-center max-w-xl mx-auto space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Shopkeeper Not Found</h2>
        <button
          onClick={() => navigate('/shopkeepers')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold"
        >
          Back to Shopkeeper Directory
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Back Navigation */}
      <button
        onClick={() => navigate('/shopkeepers')}
        className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Shopkeepers</span>
      </button>

      {/* Basic Information Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="p-4 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-black text-xl">
            <User className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                {shopkeeper.name}
              </h1>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-extrabold ${
                  shopkeeper.active
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                }`}
              >
                {shopkeeper.active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500 font-medium">
              {shopkeeper.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {shopkeeper.phone}
                </span>
              )}
              {shopkeeper.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {shopkeeper.address}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/pricing')}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 transition-colors"
        >
          <Tag className="w-4 h-4" />
          <span>Edit Product Pricing</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-slate-500 uppercase">Total Orders</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totals.count}</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-slate-500 uppercase">Total Quantity</span>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{totals.qty}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-slate-500 uppercase">Total Amount</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              ₹{totals.amt.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Product Pricing Matrix for this shopkeeper */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
          Applicable Product Pricing
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {activeProducts.map((p) => {
            const price = getApplicablePrice(shopkeeper.id, p.id, priceMappings, products);
            const isCustom = price !== p.defaultPrice;

            return (
              <div
                key={p.id}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  isCustom
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                }`}
              >
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{p.name}</p>
                <p className="text-base font-black text-slate-900 dark:text-white mt-1">₹{price}</p>
                <p className="text-[10px] text-slate-400 font-medium">
                  {isCustom ? 'Custom Rate' : 'Master Rate'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Purchase History Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">Purchase History</h3>
            <p className="text-xs text-slate-500">Historical date-wise orders</p>
          </div>

          {/* Date Range Filter Tabs */}
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            {(['all', 'today', 'yesterday', 'week', 'month'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  dateFilter === filter
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No purchase records found for this date range filter.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-900 text-white text-xs uppercase font-extrabold">
                  <th className="py-3.5 px-4">Date</th>
                  {activeProducts.map((p) => (
                    <th key={p.id} className="py-3.5 px-2 text-center">
                      {p.name}
                    </th>
                  ))}
                  <th className="py-3.5 px-4 text-center text-amber-400">Total Qty</th>
                  <th className="py-3.5 px-4 text-right text-emerald-400">Total Amount</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                {filteredEntries.map((entry) => (
                  <React.Fragment key={entry.id}>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {formatDisplayDate(entry.date)}
                      </td>

                      {activeProducts.map((p) => {
                        const item = entry.items.find((i) => i.productId === p.id);
                        const qty = item ? item.quantity : 0;
                        return (
                          <td key={p.id} className="py-3 px-2 text-center text-slate-600 dark:text-slate-300">
                            {qty > 0 ? <span className="font-extrabold text-indigo-600">{qty}</span> : '—'}
                          </td>
                        );
                      })}

                      <td className="py-3 px-4 text-center font-black text-slate-900 dark:text-white">
                        {entry.totalQuantity}
                      </td>

                      <td className="py-3 px-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                        ₹{entry.totalAmount.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedEntryId(selectedEntryId === entry.id ? null : entry.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          <ChevronRight
                            className={`w-5 h-5 transition-transform ${
                              selectedEntryId === entry.id ? 'rotate-90 text-indigo-600' : ''
                            }`}
                          />
                        </button>
                      </td>
                    </tr>

                    {/* Breakdown details row */}
                    {selectedEntryId === entry.id && (
                      <tr className="bg-indigo-50/50 dark:bg-indigo-950/30">
                        <td colSpan={activeProducts.length + 4} className="p-4">
                          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-indigo-100 dark:border-slate-700 space-y-2">
                            <h4 className="text-xs font-bold uppercase text-slate-500">
                              Transaction Breakdown for {formatDisplayDate(entry.date)}
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                              {entry.items.map((item) => {
                                const prod = products.find((p) => p.id === item.productId);
                                return (
                                  <div key={item.productId} className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    <span className="font-bold text-slate-800 dark:text-slate-200">
                                      {prod ? prod.name : 'Product'}
                                    </span>
                                    <p className="text-slate-500 mt-0.5">
                                      {item.quantity} × ₹{item.price} ={' '}
                                      <span className="font-bold text-emerald-600">₹{item.quantity * item.price}</span>
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

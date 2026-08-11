import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Shopkeeper } from '../types';
import { ConfirmModal } from '../components/common/ConfirmModal';
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  X,
  UserCheck,
} from 'lucide-react';

export const ShopkeepersPage: React.FC = () => {
  const { shopkeepers, priceMappings, dailyEntries, addShopkeeper, updateShopkeeper, deleteShopkeeper } =
    useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShopkeeper, setEditingShopkeeper] = useState<Shopkeeper | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
    active: true,
  });

  // Delete Modal state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const openAddForm = () => {
    setEditingShopkeeper(null);
    setFormData({ name: '', phone: '', address: '', notes: '', active: true });
    setIsFormOpen(true);
  };

  const openEditForm = (sk: Shopkeeper) => {
    setEditingShopkeeper(sk);
    setFormData({
      name: sk.name,
      phone: sk.phone || '',
      address: sk.address || '',
      notes: sk.notes || '',
      active: sk.active,
    });
    setIsFormOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingShopkeeper) {
      updateShopkeeper({
        ...editingShopkeeper,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        notes: formData.notes.trim(),
        active: formData.active,
      });
    } else {
      addShopkeeper({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        notes: formData.notes.trim(),
        active: formData.active,
      });
    }
    setIsFormOpen(false);
  };

  // Filtered shopkeeper list with total purchase calculation
  const shopkeeperStatsList = useMemo(() => {
    return shopkeepers.map((sk) => {
      // Calculate total purchase amount and entry count for this shopkeeper
      const skEntries = dailyEntries.filter((e) => e.shopkeeperId === sk.id);
      const totalAmount = skEntries.reduce((sum, e) => sum + (e.totalAmount || 0), 0);
      const mappedCount = priceMappings.filter((m) => m.shopkeeperId === sk.id).length;

      return {
        ...sk,
        totalAmount,
        orderCount: skEntries.length,
        mappedCount,
      };
    });
  }, [shopkeepers, dailyEntries, priceMappings]);

  const filteredShopkeepers = useMemo(() => {
    return shopkeeperStatsList.filter((sk) => {
      const matchesSearch =
        sk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sk.phone && sk.phone.includes(searchQuery));
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && sk.active) ||
        (statusFilter === 'inactive' && !sk.active);
      return matchesSearch && matchesStatus;
    });
  }, [shopkeeperStatsList, searchQuery, statusFilter]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Shopkeeper Master Directory
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage shopkeeper profiles, custom pricing, and total purchase history.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md shadow-indigo-200 dark:shadow-none transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Add Shopkeeper</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2 flex-1 max-w-md bg-slate-50 dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by shopkeeper name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-white outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          {(['all', 'active', 'inactive'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Shopkeeper Directory Table / Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-xs uppercase font-extrabold tracking-wider">
                <th className="py-4 px-5">Shopkeeper Name</th>
                <th className="py-4 px-4">Contact Phone</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-4 text-center">Custom Prices</th>
                <th className="py-4 px-4 text-right">Total Purchases</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filteredShopkeepers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No shopkeepers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredShopkeepers.map((sk) => (
                  <tr key={sk.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-5">
                      <div
                        onClick={() => navigate(`/shopkeepers/${sk.id}`)}
                        className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 cursor-pointer flex items-center space-x-2"
                      >
                        <span>{sk.name}</span>
                      </div>
                      {sk.address && (
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {sk.address}
                        </p>
                      )}
                    </td>

                    <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">
                      {sk.phone ? (
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {sk.phone}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">—</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-extrabold ${
                          sk.active
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {sk.active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{sk.active ? 'Active' : 'Inactive'}</span>
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                      {sk.mappedCount > 0 ? (
                        <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-xs">
                          {sk.mappedCount} Mapped
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs font-normal">Default</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right font-black text-emerald-600 dark:text-emerald-400 text-base">
                      ₹{sk.totalAmount.toLocaleString('en-IN')}
                    </td>

                    <td className="py-4 px-5 text-right space-x-2">
                      <button
                        onClick={() => navigate(`/shopkeepers/${sk.id}`)}
                        className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => openEditForm(sk)}
                        className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Shopkeeper"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeleteTargetId(sk.id)}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                        title="Delete Shopkeeper"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Shopkeeper Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingShopkeeper ? 'Edit Shopkeeper' : 'Add New Shopkeeper'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Shopkeeper Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anshu"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Mobile Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="Shop No. / Street / Area"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Special instructions or notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="sk-active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="sk-active" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Active Shopkeeper
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md"
                >
                  {editingShopkeeper ? 'Save Changes' : 'Create Shopkeeper'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Delete Shopkeeper?"
        message="Are you sure you want to delete this shopkeeper from the master list? Historical purchase records will remain intact."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          if (deleteTargetId) {
            deleteShopkeeper(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};

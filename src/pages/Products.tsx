import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { ConfirmModal } from '../components/common/ConfirmModal';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    defaultPrice: 0,
    unit: 'unit',
    description: '',
    active: true,
  });

  // Delete modal state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const openAddForm = () => {
    setEditingProduct(null);
    setFormData({ name: '', defaultPrice: 0, unit: 'unit', description: '', active: true });
    setIsFormOpen(true);
  };

  const openEditForm = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      defaultPrice: prod.defaultPrice,
      unit: prod.unit || 'unit',
      description: prod.description || '',
      active: prod.active,
    });
    setIsFormOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    // Check duplicate name
    const existing = products.find(
      (p) =>
        p.name.toLowerCase() === formData.name.trim().toLowerCase() &&
        p.id !== editingProduct?.id
    );
    if (existing) {
      showToast(`A product named "${formData.name.trim()}" already exists.`, 'error');
      return;
    }

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: formData.name.trim(),
        defaultPrice: Number(formData.defaultPrice) || 0,
        unit: formData.unit.trim() || 'unit',
        description: formData.description.trim(),
        active: formData.active,
      });
    } else {
      addProduct({
        name: formData.name.trim(),
        defaultPrice: Number(formData.defaultPrice) || 0,
        unit: formData.unit.trim() || 'unit',
        description: formData.description.trim(),
        active: formData.active,
      });
    }

    setIsFormOpen(false);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-600" />
            Product Master Directory
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage master product list and standard default prices. Adding products here updates all daily entry grids automatically.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md shadow-indigo-200 dark:shadow-none transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2.5 flex-1 max-w-md bg-slate-50 dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search product by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-white outline-none"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500 hidden sm:block">
          Total Products: {products.length} ({products.filter((p) => p.active).length} Active)
        </div>
      </div>

      {/* Products Master Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            className={`p-5 rounded-3xl border transition-all duration-200 bg-white dark:bg-slate-900 flex flex-col justify-between ${
              prod.active
                ? 'border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700'
                : 'border-slate-200/50 dark:border-slate-800/50 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-lg leading-tight">
                    {prod.name}
                  </h3>
                  <span className="text-xs font-medium text-slate-400 uppercase">
                    Per {prod.unit}
                  </span>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    prod.active
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                  }`}
                >
                  {prod.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="mt-4 flex items-baseline space-x-1">
                <span className="text-sm font-bold text-slate-400">Master Price:</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  ₹{prod.defaultPrice}
                </span>
              </div>

              {prod.description && (
                <p className="mt-2 text-xs text-slate-500 line-clamp-2">{prod.description}</p>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => updateProduct({ ...prod, active: !prod.active })}
                className="text-xs font-extrabold text-slate-500 hover:text-indigo-600 transition-colors"
              >
                {prod.active ? 'Deactivate' : 'Activate'}
              </button>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => openEditForm(prod)}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Edit Product"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setDeleteTargetId(prod.id)}
                  className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                  title="Delete Product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Product Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cow"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Master Default Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    placeholder="13"
                    value={formData.defaultPrice}
                    onChange={(e) => setFormData({ ...formData, defaultPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-extrabold text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    placeholder="unit / pkt / ltr"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Description / Details
                </label>
                <textarea
                  rows={2}
                  placeholder="Product description or details"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="prod-active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="prod-active" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Active Product
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
                  {editingProduct ? 'Save Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Delete Product?"
        message="Are you sure you want to delete this product from the master catalog? Existing daily entry transactions will keep their historical record."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          if (deleteTargetId) {
            deleteProduct(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};

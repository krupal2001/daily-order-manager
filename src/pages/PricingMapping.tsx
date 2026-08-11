import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Tag, Save, RotateCcw, CheckCircle2, User } from 'lucide-react';

export const PricingMappingPage: React.FC = () => {
  const { shopkeepers, products, priceMappings, updatePriceMapping, showToast } = useApp();

  const activeShopkeepers = useMemo(() => shopkeepers.filter((s) => s.active), [shopkeepers]);
  const activeProducts = useMemo(() => products.filter((p) => p.active), [products]);

  const [selectedSkId, setSelectedSkId] = useState<string>('');

  // Set default selected shopkeeper
  useEffect(() => {
    if (activeShopkeepers.length > 0 && !selectedSkId) {
      setSelectedSkId(activeShopkeepers[0].id);
    }
  }, [activeShopkeepers, selectedSkId]);

  // Draft local mapping prices for the selected shopkeeper: productId -> price (number | null)
  const [draftPrices, setDraftPrices] = useState<Record<string, number | null>>({});

  useEffect(() => {
    if (!selectedSkId) return;
    const map: Record<string, number | null> = {};
    activeProducts.forEach((prod) => {
      const mapping = priceMappings.find(
        (m) => m.shopkeeperId === selectedSkId && m.productId === prod.id
      );
      map[prod.id] = mapping ? mapping.price : null;
    });
    setDraftPrices(map);
  }, [selectedSkId, activeProducts, priceMappings]);

  const selectedSk = activeShopkeepers.find((s) => s.id === selectedSkId);

  const handlePriceChange = (productId: string, val: string) => {
    if (val === '') {
      setDraftPrices((prev) => ({ ...prev, [productId]: null }));
      return;
    }
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 0) {
      setDraftPrices((prev) => ({ ...prev, [productId]: parsed }));
    }
  };

  const handleSaveChanges = () => {
    if (!selectedSkId) return;
    activeProducts.forEach((prod) => {
      const price = draftPrices[prod.id];
      updatePriceMapping(selectedSkId, prod.id, price);
    });
  };

  const handleResetToDefault = () => {
    if (!selectedSkId) return;
    const resetMap: Record<string, number | null> = {};
    activeProducts.forEach((prod) => {
      resetMap[prod.id] = null;
      updatePriceMapping(selectedSkId, prod.id, null);
    });
    setDraftPrices(resetMap);
    showToast(`Reset pricing for "${selectedSk?.name}" to master default prices.`, 'info');
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Tag className="w-6 h-6 text-indigo-600" />
            Shopkeeper Product Price Mapping
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Configure custom rates per shopkeeper. Daily entries automatically apply shopkeeper mapped prices over master default prices.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleResetToDefault}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>Reset to Default</span>
          </button>

          <button
            onClick={handleSaveChanges}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Mapping</span>
          </button>
        </div>
      </div>

      {/* Select Shopkeeper Dropdown Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 flex-1 max-w-md">
          <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-0.5">
              Select Shopkeeper
            </label>
            <select
              value={selectedSkId}
              onChange={(e) => setSelectedSkId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 cursor-pointer"
            >
              {activeShopkeepers.map((sk) => (
                <option key={sk.id} value={sk.id}>
                  {sk.name} {sk.phone ? `(${sk.phone})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedSk && (
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500">Configured Shopkeeper:</span>
            <p className="text-lg font-black text-slate-900 dark:text-white">{selectedSk.name}</p>
          </div>
        )}
      </div>

      {/* Price Mapping Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-xs uppercase font-extrabold tracking-wider">
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6 text-center">Master Default Price</th>
                <th className="py-4 px-6 text-center">Shopkeeper Specific Price (₹)</th>
                <th className="py-4 px-6 text-center">Pricing Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {activeProducts.map((prod) => {
                const currentDraftPrice = draftPrices[prod.id];
                const isCustom = currentDraftPrice !== null && currentDraftPrice !== undefined;
                const effectivePrice = isCustom ? currentDraftPrice : prod.defaultPrice;

                return (
                  <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 dark:text-white">{prod.name}</div>
                      <span className="text-xs text-slate-400 font-medium">Per {prod.unit}</span>
                    </td>

                    <td className="py-4 px-6 text-center font-bold text-slate-500">
                      ₹{prod.defaultPrice}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex items-center space-x-2">
                        <span className="text-sm font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          placeholder={String(prod.defaultPrice)}
                          value={currentDraftPrice === null ? '' : currentDraftPrice}
                          onChange={(e) => handlePriceChange(prod.id, e.target.value)}
                          className={`w-28 h-10 text-center font-extrabold text-sm rounded-xl border outline-none transition-all ${
                            isCustom
                              ? 'bg-indigo-50 border-indigo-400 text-indigo-950 dark:bg-indigo-950/80 dark:border-indigo-600 dark:text-indigo-100 ring-2 ring-indigo-200'
                              : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
                          }`}
                        />
                      </div>
                    </td>

                    <td className="py-4 px-6 text-center">
                      {isCustom ? (
                        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Custom Price (₹{effectivePrice})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          <span>Master Default (₹{prod.defaultPrice})</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

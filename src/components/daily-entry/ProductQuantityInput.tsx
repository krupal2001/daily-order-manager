import React from 'react';

interface ProductQuantityInputProps {
  quantity: number;
  price: number;
  productName: string;
  onChange: (newQty: number) => void;
  disabled?: boolean;
}

export const ProductQuantityInput: React.FC<ProductQuantityInputProps> = ({
  quantity = 0,
  price = 0,
  productName,
  onChange,
  disabled = false,
}) => {
  const safeQty = typeof quantity === 'number' && !isNaN(quantity) ? quantity : 0;
  const safePrice = typeof price === 'number' && !isNaN(price) ? price : 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      onChange(0);
      return;
    }
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 0) {
      onChange(parsed);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const amount = safeQty * safePrice;

  return (
    <div className="flex flex-col items-center justify-center p-1 group relative">
      <input
        type="number"
        min="0"
        step="any"
        disabled={disabled}
        value={safeQty === 0 ? '' : safeQty}
        onChange={handleChange}
        onFocus={handleFocus}
        placeholder="0"
        className={`w-16 h-10 text-center font-bold text-sm rounded-lg border transition-all duration-150 outline-none ${
          safeQty > 0
            ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 dark:bg-indigo-950/60 dark:border-indigo-600 dark:text-indigo-100 ring-2 ring-indigo-200 dark:ring-indigo-800'
            : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'
        }`}
      />
      <div className="flex items-center justify-between w-full px-1 mt-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
        <span className="text-slate-400">₹{safePrice}</span>
        {safeQty > 0 && <span className="text-indigo-600 dark:text-indigo-400 font-bold">₹{amount}</span>}
      </div>

      {/* Hover Info Tooltip */}
      <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
        <div className="bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-xl border border-slate-700 whitespace-nowrap">
          <span>{productName}</span>: {safeQty} × ₹{safePrice} = <span className="text-emerald-400 font-bold">₹{amount}</span>
        </div>
        <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1"></div>
      </div>
    </div>
  );
};

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Printer, Download, Settings, Sparkles } from 'lucide-react';
import { formatDisplayDate } from '../../services/calculationService';
import { exportJSONBackup } from '../../services/exportService';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard Overview';
      case '/daily-entry':
        return 'Daily Order Entry';
      case '/records':
        return 'Daily Records History';
      case '/shopkeepers':
        return 'Shopkeeper Master Directory';
      case '/products':
        return 'Product Master Directory';
      case '/pricing':
        return 'Shopkeeper Product Price Mapping';
      case '/reports':
        return 'Sales & Analytics Reports';
      case '/settings':
        return 'Application Settings & Data Backup';
      default:
        if (location.pathname.startsWith('/shopkeepers/')) return 'Shopkeeper Details';
        return 'Order Management System';
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <header className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3.5 flex items-center justify-between no-print">
      <div className="flex items-center space-x-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {getPageTitle()}
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              <Sparkles className="w-3 h-3 mr-1" /> Ready
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Digitized Daily Purchase Book & Ledger
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Quick Date Display */}
        <div
          onClick={() => navigate('/daily-entry')}
          className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Today: {formatDisplayDate(todayStr)}</span>
        </div>

        {/* Action Buttons */}
        <button
          onClick={() => window.print()}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Print Screen / Order Book"
        >
          <Printer className="w-5 h-5" />
        </button>

        <button
          onClick={exportJSONBackup}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Export JSON Data Backup"
        >
          <Download className="w-5 h-5" />
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

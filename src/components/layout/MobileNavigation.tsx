import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarPlus,
  History,
  Users,
  Package,
  Tag,
  BarChart3,
  Settings,
  Menu,
  X,
  Store,
} from 'lucide-react';

export const MobileNavigation: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const mainBottomNavItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Daily Entry', path: '/daily-entry', icon: CalendarPlus, highlight: true },
    { name: 'Records', path: '/records', icon: History },
    { name: 'Shopkeepers', path: '/shopkeepers', icon: Users },
  ];

  const drawerNavItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Daily Entry', path: '/daily-entry', icon: CalendarPlus },
    { name: 'Daily Records', path: '/records', icon: History },
    { name: 'Shopkeepers', path: '/shopkeepers', icon: Users },
    { name: 'Products Master', path: '/products', icon: Package },
    { name: 'Price Mapping', path: '/pricing', icon: Tag },
    { name: 'Reports & Charts', path: '/reports', icon: BarChart3 },
    { name: 'Settings & Backup', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Top Mobile Bar with Hamburger */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 no-print">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">OrderManager</h1>
            <p className="text-[10px] text-slate-500 font-medium">Daily Shopkeeper System</p>
          </div>
        </div>
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {drawerOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Drawer Overlay */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm no-print" onClick={() => setDrawerOpen(false)}>
          <div
            className="w-4/5 max-w-xs h-full bg-white dark:bg-slate-900 p-4 shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <Store className="w-6 h-6 text-indigo-600" />
                  <span className="font-extrabold text-slate-900 dark:text-white">Navigation</span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {drawerNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setDrawerOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`
                      }
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-400 font-medium">Daily Shopkeeper System v1.0</p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 py-2 shadow-lg no-print">
        {mainBottomNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                    : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{item.name}</span>
            </NavLink>
          );
        })}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-500 dark:text-slate-400 font-medium"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">More</span>
        </button>
      </div>
    </>
  );
};

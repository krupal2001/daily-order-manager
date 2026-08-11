import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNavigation } from './components/layout/MobileNavigation';
import { ToastContainer } from './components/common/ToastContainer';
import { PrintableOrderBook } from './components/print/PrintableOrderBook';


import { DashboardPage } from './pages/Dashboard';
import { DailyEntryPage } from './pages/DailyEntry';
import { DailyRecordsPage } from './pages/DailyRecords';
import { ShopkeepersPage } from './pages/Shopkeepers';
import { ShopkeeperDetailsPage } from './pages/ShopkeeperDetails';
import { ProductsPage } from './pages/Products';
import { PricingMappingPage } from './pages/PricingMapping';
import { ReportsPage } from './pages/Reports';
import { SettingsPage } from './pages/Settings';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
          {/* Desktop Collapsible Sidebar */}
          <Sidebar />

          {/* Main Layout Area */}
          <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
            {/* Desktop Top Header */}
            <Header />

            {/* Mobile Top Header & Bottom Nav */}
            <MobileNavigation />

            {/* Page Router View */}
            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/daily-entry" element={<DailyEntryPage />} />
                <Route path="/records" element={<DailyRecordsPage />} />
                <Route path="/shopkeepers" element={<ShopkeepersPage />} />
                <Route path="/shopkeepers/:id" element={<ShopkeeperDetailsPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/pricing" element={<PricingMappingPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </main>
          </div>

          {/* Toast Notification Container */}
          <ToastContainer />

          {/* Printable A4 Paper Order Book Layout */}
          <PrintableOrderBook />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;

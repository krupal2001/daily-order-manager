import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { exportJSONBackup } from '../services/exportService';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { AppDataBackup } from '../types';
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  Trash2,
  ShieldAlert,
  Save,
  Database,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, importBackupData, resetAll, showToast } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formSettings, setFormSettings] = useState(settings);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string) as AppDataBackup;
        const success = importBackupData(json);
        if (success && fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (err) {
        showToast('Invalid JSON backup file format.', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-indigo-600" />
          Application Settings & Data Backup
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Configure preferences, manage currency & date formatting, and backup local storage to JSON files.
        </p>
      </div>

      {/* Preferences Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
          Preferences & Localization
        </h3>

        <form onSubmit={handleSavePreferences} className="space-y-4 max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={formSettings.currency}
                onChange={(e) => setFormSettings({ ...formSettings, currency: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Currency Code
              </label>
              <input
                type="text"
                value={formSettings.currencyCode}
                onChange={(e) => setFormSettings({ ...formSettings, currencyCode: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Date Format
              </label>
              <select
                value={formSettings.dateFormat}
                onChange={(e) => setFormSettings({ ...formSettings, dateFormat: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white outline-none"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 11/08/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-08-11)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Default Quantity Unit
              </label>
              <input
                type="text"
                value={formSettings.defaultUnit}
                onChange={(e) => setFormSettings({ ...formSettings, defaultUnit: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </form>
      </div>

      {/* Data Backup & Restore Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              Backup & Restore (Local Storage)
            </h3>
            <p className="text-xs text-slate-500">Safeguard your data by exporting JSON backups to your device</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export JSON Card */}
          <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800 space-y-3">
            <div className="p-2.5 w-fit rounded-xl bg-indigo-600 text-white shadow-sm">
              <Download className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-base">Export Backup JSON</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Download complete backup containing all Products, Shopkeepers, Price Mappings, and Daily Entries as a JSON file.
            </p>
            <button
              onClick={exportJSONBackup}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Backup File</span>
            </button>
          </div>

          {/* Import JSON Card */}
          <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800 space-y-3">
            <div className="p-2.5 w-fit rounded-xl bg-emerald-600 text-white shadow-sm">
              <Upload className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-base">Import Backup JSON</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Restore complete application data from a previously saved JSON backup file.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Select Backup File</span>
            </button>
          </div>
        </div>
      </div>

      {/* Clear Local Storage Section */}
      <div className="bg-rose-50/50 dark:bg-rose-950/30 rounded-3xl border border-rose-200 dark:border-rose-900 p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-3">
          <ShieldAlert className="w-6 h-6 text-rose-600" />
          <h3 className="text-base font-extrabold text-rose-900 dark:text-rose-300">
            Clear Local Storage Data
          </h3>
        </div>
        <p className="text-xs text-rose-700 dark:text-rose-400">
          Clearing local storage will permanently delete all products, shopkeepers, custom prices, daily entries, and settings. The application will start in a completely fresh empty state without seed data. Make sure to export a backup first!
        </p>

        <button
          onClick={() => setIsResetModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md transition-all"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Local Storage</span>
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetModalOpen}
        title="Clear All Local Storage Data?"
        message="Are you completely sure you want to remove all seed data, shopkeepers, price mappings, and daily entries? Storage will be completely wiped and the app will reset to a clean empty state."
        confirmText="Yes, Clear Local Storage"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          resetAll();
          setIsResetModalOpen(false);
        }}
        onCancel={() => setIsResetModalOpen(false)}
      />
    </div>
  );
};

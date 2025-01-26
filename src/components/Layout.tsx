import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isDarkMode } = useTheme();
  const { pathname } = useLocation();

  return (
    <div className={`min-h-screen flex flex-col ${
      isDarkMode ? 'bg-dark-bg text-dark-text' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Admin Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Triple A Admin</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-6">
        {children}
      </main>
    </div>
  );
}
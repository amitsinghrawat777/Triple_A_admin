import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Navigation from './Navigation';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Layout() {
  const { logout } = useAuth();
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col ${
      isDarkMode ? 'bg-dark-bg text-dark-text' : 'bg-gray-50 text-gray-900'
    }`}>
      <Header />
      <main className="flex-1 pb-24 pt-16">
        <Outlet />
      </main>
      <Navigation onLogout={logout} />
    </div>
  );
}
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isDarkMode, setTheme } = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      // First clear any stored data
      localStorage.clear();
      sessionStorage.clear();
      
      // Then sign out from Firebase
      await signOut(auth);
      
      // Finally, do a hard redirect to login and prevent back navigation
      window.location.replace('/login');
      window.history.pushState(null, '', '/login');
    } catch (error) {
      console.error('Error signing out:', error);
      // If error occurs, still try to redirect
      window.location.replace('/login');
      window.history.pushState(null, '', '/login');
    }
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setTheme(theme);
    setIsThemeMenuOpen(false);
  };

  return (
    <div className={`min-h-screen flex flex-col ${
      isDarkMode ? 'bg-dark-bg text-dark-text' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Admin Header */}
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className={`text-xl font-semibold flex items-center gap-2`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="w-6 h-6 text-emerald-600">
              <path d="m6.5 6.5 11 11"></path>
              <path d="m21 21-1-1"></path>
              <path d="m3 3 1 1"></path>
              <path d="m18 22 4-4"></path>
              <path d="m2 6 4-4"></path>
              <path d="m3 10 7-7"></path>
              <path d="m14 21 7-7"></path>
            </svg>
            <span className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-600">Triple A</span>
            <span className="text-shadow-600 font-bold">-</span>
            <span className="text-amber-600 font-bold">Admin</span>
          </h1>
          
          <div className="flex items-center space-x-4">
            {/* Theme Toggle Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className={`p-2 rounded-md ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>

              {isThemeMenuOpen && (
                <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-white'
                } ring-1 ring-black ring-opacity-5`}>
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      isDarkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      isDarkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => handleThemeChange('system')}
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      isDarkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    System
                  </button>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleSignOut}
              className={`px-4 py-2 rounded-md ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-6">
        {children}
      </main>
    </div>
  );
}
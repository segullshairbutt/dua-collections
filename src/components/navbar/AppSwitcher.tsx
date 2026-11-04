'use client';

import { FC, useEffect, useRef, useState } from 'react';

import Link from 'next/link';

import { APPS_LIST } from './routes';

interface AppSwitcherProps {
  currentAppId: string;
}

const AppSwitcher: FC<AppSwitcherProps> = ({ currentAppId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Atlassian-style Waffle/Dots Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center justify-center focus:outline-none"
        aria-label="Switch Apps"
        title="Switch Apps"
      >
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-800">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Switch Product</p>
          </div>

          {APPS_LIST.map(app => {
            const isActive = currentAppId === app.id;
            return (
              <Link
                key={app.id}
                href={app.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 py-3 hover:bg-gray-800 transition-colors ${
                  isActive ? 'bg-gray-800/80 border-l-4 border-indigo-500' : ''
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-white">{app.name}</p>
                  <p className="text-xs text-gray-400">{app.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AppSwitcher;

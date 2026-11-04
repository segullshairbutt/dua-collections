import React, { FC, useEffect, useRef, useState } from 'react';

import Link from 'next/link';

import { TAGS_ROUTES } from './routes';

interface BaseMenuLinkProps {
  navbar?: boolean;
  toggle: () => void;
}

interface MenuLinksProps extends BaseMenuLinkProps {
  queryParm?: string | null;
  ulClassName?: string;
  isMobileDrawer?: boolean;
}

const MenuLinks: FC<MenuLinksProps> = ({ toggle, queryParm, ulClassName, isMobileDrawer = false }) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(TAGS_ROUTES.length);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLLIElement>(null);

  // Dynamic ResizeObserver only runs on desktop/tablet
  useEffect(() => {
    if (isMobileDrawer) return;

    const checkWidth = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      const estimatedItemWidth = 100;
      const maxPossible = Math.floor((containerWidth - 70) / estimatedItemWidth);
      const calculated = Math.max(2, Math.min(TAGS_ROUTES.length, maxPossible));
      setVisibleCount(calculated);
    };

    checkWidth();
    const observer = new ResizeObserver(checkWidth);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isMobileDrawer]);

  // Close dropdown on outside click
  useEffect(() => {
    if (isMobileDrawer) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isMobileDrawer]);

  const visibleRoutes = isMobileDrawer ? TAGS_ROUTES : TAGS_ROUTES.slice(0, visibleCount);
  const overflowRoutes = isMobileDrawer ? [] : TAGS_ROUTES.slice(visibleCount);

  const hasOverflowItems = overflowRoutes.length > 0;
  const isMoreActive = overflowRoutes.some(
    item => queryParm === (typeof item === 'string' ? item : item.url.query?.tag)
  );

  return (
    <div
      ref={containerRef}
      className={isMobileDrawer ? 'w-full' : 'flex items-center justify-end overflow-visible w-full'}
    >
      <ul
        className={`${ulClassName} ${!isMobileDrawer ? 'flex items-center space-x-1 lg:space-x-2 flex-nowrap relative' : 'w-full'}`}
      >
        {/* Render Links */}
        {visibleRoutes.map(({ name, url }, inx) => (
          <li key={inx} className={isMobileDrawer ? 'list-none my-1 w-full' : 'list-none shrink-0'}>
            <NavLink url={url} name={name} toggle={toggle} isActive={queryParm === url.query?.tag} />
          </li>
        ))}

        {/* "More" Dropdown Button (Only on desktop/tablet when items overflow) */}
        {!isMobileDrawer && hasOverflowItems && (
          <li className="list-none shrink-0 relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsMoreOpen(prev => !prev)}
              className={`text-xs lg:text-sm font-semibold rounded px-2.5 py-1.5 transition-colors flex items-center space-x-1 cursor-pointer ${
                isMoreActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-indigo-50/10 active:bg-indigo-100/20 hover:text-indigo-400'
              }`}
            >
              <span>More</span>
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isMoreOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl py-2 z-50">
                <div className="px-3 py-1.5 border-b border-gray-800">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">More Categories</p>
                </div>

                {overflowRoutes.map(({ name, url }, inx) => (
                  <NavLink
                    url={url}
                    name={name}
                    toggle={() => {
                      setIsMoreOpen(false);
                      toggle();
                    }}
                    key={`overflowingLinks-${inx}`}
                    className="!rounded-none"
                    isActive={queryParm === url.query?.tag}
                  />
                ))}
              </div>
            )}
          </li>
        )}
      </ul>
    </div>
  );
};

export default MenuLinks;

interface NavLinkProps extends BaseMenuLinkProps {
  name: string;
  isActive?: boolean;
  className?: string;
  url: {
    pathname: string;
    query?: { tag: string };
  };
}

const NavLink: FC<NavLinkProps> = ({ name, toggle, url, isActive, className = '' }) => {
  return (
    <Link
      className={`block w-full text-xs lg:text-sm font-semibold rounded px-2.5 py-1.5 transition-colors whitespace-nowrap ${
        isActive
          ? 'bg-indigo-600 text-white'
          : 'text-gray-300 hover:bg-indigo-50/10 active:bg-indigo-100/20 hover:text-indigo-400'
      } ${className}`}
      onClick={toggle}
      href={url}
    >
      {name}
    </Link>
  );
};

'use client';

import { useCallback, useMemo, useState } from 'react';

import { usePathname, useSearchParams } from 'next/navigation';

import { Category } from '../Categories';
import AppSwitcher from './AppSwitcher';
import MenuLinks from './MenuLinks';
import NavButton from './NavButton';
import NavHeading from './NavHeading';
import { TAGS_ROUTES } from './routes';

import duas from '@/data/duas.json';

const Navbar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [navbar, setNavbar] = useState(false);
  const toggleNavbar = useCallback(() => setNavbar(prev => !prev), []);

  const isPrayerTimes = pathname.startsWith('/prayer-times');
  const currentAppId = isPrayerTimes ? 'app-b' : 'app-a';

  const allCategories = useMemo(() => {
    if (isPrayerTimes) return [];
    const tagsDisplayedInMenu = TAGS_ROUTES.reduce((acc: string[], current) => {
      if (current.url.query && current.url.query.tag) {
        acc.push(current.url.query.tag);
      }
      return acc;
    }, []);

    return duas
      .flatMap(d => d.tags)
      .filter((value, index, array) => {
        return array.indexOf(value) === index && !tagsDisplayedInMenu.includes(value);
      });
  }, [isPrayerTimes]);

  return (
    <nav className="w-full bg-gray-800 shadow relative z-50">
      <div className="justify-between px-4 mx-auto lg:max-w-7xl md:items-center md:flex md:px-8">
        <div>
          <div className="flex items-center justify-between py-3 md:py-5">
            <NavHeading currentPath={pathname} />
            {!isPrayerTimes && <NavButton toggle={toggleNavbar} navbar={navbar} />}
          </div>
        </div>

        {/* Desktop / Tablet Links & App Switcher */}
        <div className="hidden md:flex items-center space-x-4 flex-1 justify-end">
          {!isPrayerTimes && (
            <div className="max-w-2xl flex-1">
              <MenuLinks toggle={toggleNavbar} queryParm={searchParams.get('tag')} />
            </div>
          )}

          {/* Atlassian-style App Switcher with exact requested styling */}
          <div className={`shrink-0 flex items-center ${!isPrayerTimes ? 'border-l-2 pl-6 border-gray-600' : ''}`}>
            <AppSwitcher currentAppId={currentAppId} />
          </div>
        </div>

        {/* Mobile Drawer (Identical to your original old code layout) */}
        {!isPrayerTimes && (
          <div className="md:hidden">
            <div
              tabIndex={-1}
              id="drawer-navigation"
              className={`fixed top-0 left-0 z-40 w-64 h-screen p-4 overflow-y-auto transition-transform bg-gray-800 shadow ${navbar ? 'transform-none' : '-translate-x-full'}`}
              aria-labelledby="drawer-navigation-label"
            >
              <div className="py-4 overflow-y-auto">
                {/* Full vertical menu list matching your original old setup */}
                <MenuLinks
                  toggle={toggleNavbar}
                  queryParm={searchParams.get('tag')}
                  ulClassName="space-y-2 font-medium"
                  isMobileDrawer
                />

                <div className="border-t-[.5px] my-3 border-gray-300/20" />

                <ul className="flex flex-wrap items-center justify-start">
                  {allCategories.map((tag, index) => (
                    <Category
                      key={index}
                      tag={tag}
                      activeClassName="text-indigo-100"
                      isActive={tag === searchParams.get('tag')}
                      onClick={toggleNavbar}
                    />
                  ))}
                </ul>
              </div>
            </div>
            {navbar && <div className="fixed top-0 left-0 z-30 bg-black/10 w-full h-full" onClick={toggleNavbar}></div>}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

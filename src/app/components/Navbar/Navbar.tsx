'use client';

import { useCallback, useMemo, useState } from 'react';

import { usePathname, useSearchParams } from 'next/navigation';

import allDuas from 'duas.json';
import { Category } from '../Categories';
import { menu } from './menu';
import NavHeading from './NavHeading';
import NavButton from './NavButton';
import MenuLinks from './MenuLinks';

const Navbar = () => {

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [navbar, setNavbar] = useState(false);
  const toggleNavbar = useCallback(() => setNavbar(prev => !prev), []);

  const allCategories = useMemo(() => {
    const tagsDisplayedInMenu = menu.reduce((acc: string[], qParams) => {
      if (qParams.url.query && qParams.url.query.tag) {
        acc.push(qParams.url.query.tag);
      }
      return acc;
    }, []);

    return allDuas.flatMap(d => d.tags).filter((value, index, array) => {
      return array.indexOf(value) === index && !tagsDisplayedInMenu.includes(value);
    });
  }, []);

  return (
    <nav className="w-full bg-gray-800 shadow">
      <div className="justify-between px-4 mx-auto lg:max-w-7xl md:items-center md:flex md:px-8">
        <div>
          <div className="flex items-center justify-between py-3 md:py-5 md:block">
            <NavHeading currentPath={pathname} />
            <NavButton toggle={toggleNavbar} navbar={navbar} />
          </div>
        </div>
        <div>
          <div className="md:hidden">
            <div
              tabIndex={-1}
              id="drawer-navigation"
              className={`fixed top-0 left-0 z-40 w-64 h-screen p-4 overflow-y-auto transition-transform bg-gray-800 shadow ${navbar ? 'transform-none' : '-translate-x-full'}`}
              aria-labelledby="drawer-navigation-label"
            >
              <div className="py-4 overflow-y-auto">
                <MenuLinks
                  toggle={toggleNavbar}
                  queryParm={searchParams.get('tag')}
                  ulClassName="space-y-2 font-medium"
                />

                <div className="border-t-[.5px] my-3 border-gray-300/20" />

                <ul className="flex flex-wrap items-center justify-start">
                  {
                    allCategories.map((tag, inx) => (
                      <Category
                        key={inx}
                        tag={tag}
                        activeClassName='text-indigo-100'
                        isActive={tag === searchParams.get('tag')}
                        onClick={toggleNavbar}
                      />
                    ))
                  }
                </ul>
              </div>
            </div>
            {navbar && <div className="fixed top-0 left-0 z-30 bg-black/10 w-full h-full" onClick={toggleNavbar}></div>}
          </div>

          <div className={`flex-1 justify-self-center pb-3 mt-8 md:block hidden md:pb-0 md:mt-0`}>
            <MenuLinks
              toggle={toggleNavbar}
              queryParm={searchParams.get('tag')}
              ulClassName="items-center justify-center space-y-8 md:flex lg:space-x-6 md:space-x-2 md:space-y-0"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;



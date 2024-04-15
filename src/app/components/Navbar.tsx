'use client';

import { Fragment, useCallback, useMemo, useState } from 'react';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import BackButton from './BackButton';

import allDuas from 'duas.json';

interface INavComponentProps {
  navbar?: boolean;
  toggle: () => void;
}

const menu = [
  { name: 'All', url: { pathname: '/Duas' } },
  { name: 'Quranic Duas', url: { pathname: '/Duas', query: { tag: 'Quran' } } },
  { name: 'Masnoon Duas', url: { pathname: '/Duas', query: { tag: 'Masnoon' } } },
  { name: 'Sleeping', url: { pathname: '/Duas', query: { tag: 'Sleep' } } },
  { name: 'Mosque', url: { pathname: '/Duas', query: { tag: 'Mosque' } } },
  { name: 'House', url: { pathname: '/Duas', query: { tag: 'House' } } },
];

const Navbar = () => {
  const searchParams = useSearchParams();
  const [navbar, setNavbar] = useState(false);
  const toggleNavbar = useCallback(() => setNavbar(prev => !prev), []);

  const otherTags = useMemo(() => {
    const mTags = menu.reduce((acc: string[], qParams) => {
      if (qParams.url.query && qParams.url.query.tag) {
        acc.push(qParams.url.query.tag);
      }
      return acc;
    }, []);

    const dTags = allDuas.flatMap(d => d.tags);
    return dTags.filter((value, index, array) => {
      return array.indexOf(value) === index && !mTags.includes(value);
    });
  }, []);

  return (
    <nav className="w-full bg-gray-800 shadow">
      <div className="justify-between px-4 mx-auto lg:max-w-7xl md:items-center md:flex md:px-8">
        <div>
          <div className="flex items-center justify-between py-3 md:py-5 md:block">
            <NavHeading />
            <div className="md:hidden">
              <button
                className="text-gray-400 cursor-pointer hover:text-gray-500 relative z-50"
                onClick={() => setNavbar(!navbar)}
              >
                {navbar ? (
                  <i className="block h-4 w-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                  </i>
                ) : (
                  <i className="block h-4 w-4">
                    <svg viewBox="0 0 20 20" className="fill-current" xmlns="http://www.w3.org/2000/svg">
                      <title>Toggle Menu</title>
                      <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
                    </svg>
                  </i>
                )}
              </button>
            </div>
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
                <ul className="space-y-2 font-medium">
                  <MenuLinks toggle={toggleNavbar} navbar={navbar} />
                </ul>

                <div className="border-t-[.5px] my-3 border-gray-300/20" />

                <ul className="flex flex-wrap items-center justify-start">
                  {otherTags.map((tag, ix) => {
                    const isActive = tag === searchParams.get('tag');
                    return (
                      <li
                        key={ix}
                        className={`text-xs font-medium mx-1 my-1 text-gray-500 active:bg-indigo-100 hover:text-indigo-600 rounded ${isActive && 'text-indigo-100'}`}
                      >
                        <Link className="px-1" onClick={toggleNavbar} href={{ pathname: '/Duas', query: { tag: tag } }}>
                          {tag}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            {navbar && <div className="fixed top-0 left-0 z-30 bg-black/10 w-full h-full" onClick={toggleNavbar}></div>}
          </div>

          <div className={`flex-1 justify-self-center pb-3 mt-8 md:block hidden md:pb-0 md:mt-0`}>
            <ul className="items-center justify-center space-y-8 md:flex lg:space-x-6 md:space-x-2 md:space-y-0">
              <MenuLinks toggle={toggleNavbar} />
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

const NavHeading = () => {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1">
      {pathname !== '/' && <BackButton className="text-white" />}
      <Link href="/">
        <h5 id="drawer-navigation-label" className="font-bold text-gray-300 uppercase dark:text-gray-400">
          Dua Collection
        </h5>
      </Link>
    </div>
  );
};

const MenuLinks = ({ toggle }: INavComponentProps) => {
  const searchParams = useSearchParams();

  return (
    <Fragment>
      {menu.map(({ name, url }, index) => {
        const isActive = searchParams.get('tag') === url.query?.tag;
        return (
          <li
            key={index}
            className={`block text-sm font-semibold text-gray-400 hover:bg-indigo-50 active:bg-indigo-100 hover:text-indigo-600 rounded ${isActive && 'text-indigo-50'}`}
          >
            <Link className="block w-full p-2" onClick={toggle} href={url}>
              {name}
            </Link>
          </li>
        );
      })}
    </Fragment>
  );
};

import React from 'react';

import Link from 'next/link';

import { MenuLinksProps, NavLinkProps } from './interface';
import { menu } from './menu';

const MenuLinks = ({ toggle, queryParm, ulClassName }: MenuLinksProps) => {
  return (
    <ul className={ulClassName}>
      {menu.map(({ name, url }, inx) => (
        <NavLink key={inx} url={url} name={name} toggle={toggle} isActive={queryParm === url.query?.tag} />
      ))}
    </ul>
  );
};

export default MenuLinks;

const NavLink = ({ name, toggle, url, isActive }: NavLinkProps) => {
  return (
    <li
      className={`block text-sm font-semibold text-gray-400 hover:bg-indigo-50 active:bg-indigo-100 hover:text-indigo-600 rounded ${isActive && 'text-indigo-50'}`}
    >
      <Link className="block w-full p-2" onClick={toggle} href={url}>
        {name}
      </Link>
    </li>
  );
};

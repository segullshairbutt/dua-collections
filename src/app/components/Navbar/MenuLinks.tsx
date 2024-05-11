import React, { FC } from 'react';

import Link from 'next/link';

import { TAGS_ROUTES } from './routes';

interface BaseMenuLinkProps {
  navbar?: boolean;
  toggle: () => void;
}

interface MenuLinksProps extends BaseMenuLinkProps {
  queryParm?: string | null;
  ulClassName?: string;
}

const MenuLinks: FC<MenuLinksProps> = ({ toggle, queryParm, ulClassName }) => {
  return (
    <ul className={ulClassName}>
      {TAGS_ROUTES.map(({ name, url }, inx) => (
        <NavLink key={inx} url={url} name={name} toggle={toggle} isActive={queryParm === url.query?.tag} />
      ))}
    </ul>
  );
};

export default MenuLinks;

interface NavLinkProps extends BaseMenuLinkProps {
  name: string;
  isActive?: boolean;
  url: {
    pathname: string;
    query?: { tag: string };
  };
}
const NavLink: FC<NavLinkProps> = ({ name, toggle, url, isActive }) => {
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

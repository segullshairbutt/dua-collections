import React, { FC } from 'react';

import Link from 'next/link';

import BackButton from 'components/BackButton';

interface NavHeadingProps {
  currentPath: string;
}

const NavHeading: FC<NavHeadingProps> = ({ currentPath }) => {
  return (
    <div className="flex items-center gap-1">
      {currentPath !== '/' && <BackButton className="text-white" />}
      <Link href="/">
        <h5 id="drawer-navigation-label" className="font-bold text-gray-300 uppercase dark:text-gray-400">
          Dua Collection
        </h5>
      </Link>
    </div>
  );
};

export default NavHeading;

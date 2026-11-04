import React, { FC } from 'react';

import Link from 'next/link';

import BackButton from '../BackButton';
import AppSwitcher from './AppSwitcher';

interface NavHeadingProps {
  currentPath: string;
}

const NavHeading: FC<NavHeadingProps> = ({ currentPath }) => {
  const isPrayerTimes = currentPath.startsWith('/prayer-times');
  const currentAppId = isPrayerTimes ? 'app-b' : 'app-a';
  const appTitle = isPrayerTimes ? 'Prayer Times' : 'Dua Collection';

  return (
    <div className="flex items-center justify-between w-full md:w-auto gap-3">
      <div className="flex items-center gap-1">
        {currentPath !== '/' && <BackButton className="text-white" />}
        <Link href={isPrayerTimes ? '/prayer-times' : '/duas'}>
          <h5 id="drawer-navigation-label" className="font-bold text-gray-300 uppercase dark:text-gray-400">
            {appTitle}
          </h5>
        </Link>
      </div>

      {/* Mobile App Switcher button */}
      <div className="md:hidden">
        <AppSwitcher currentAppId={currentAppId} />
      </div>
    </div>
  );
};

export default NavHeading;

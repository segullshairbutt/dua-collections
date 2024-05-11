import React, { FC } from 'react';

interface NavButtonProps {
  navbar?: boolean;
  toggle: () => void;
}
const NavButton: FC<NavButtonProps> = ({ toggle, navbar }) => {
  return (
    <div className="md:hidden">
      <button className="text-gray-400 cursor-pointer hover:text-gray-500 relative z-50" onClick={toggle}>
        {navbar ? (
          <i className="block h-4 w-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </i>
        ) : (
          <i className="block h-4 w-4">
            <svg viewBox="0 0 20 20" className="fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
            </svg>
          </i>
        )}
      </button>
    </div>
  );
};

export default NavButton;

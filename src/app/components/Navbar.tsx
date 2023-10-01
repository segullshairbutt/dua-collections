"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import BackButton from './BackButton';

const Navbar = () => {

    const pathname = usePathname();
    const [navbar, setNavbar] = useState(false);
    const menu = [
        { name: "Quranic Duas", url: "/QuranDuas" },
        { name: "Masnoon Duas", url: "/MasnoonDuas" },
    ];

    return (
        <nav className="w-full bg-gray-800 shadow">
            <div className="justify-between px-4 mx-auto lg:max-w-7xl md:items-center md:flex md:px-8">
                <div>
                    <div className="flex items-center justify-between py-3 md:py-5 md:block">
                        <div className='flex items-center gap-2'>
                            {
                                pathname !== "/" && (
                                    <BackButton className='text-white' />
                                )
                            }
                            <Link href="/">
                                <div className="avatar">
                                    <div className="w-16 rounded">
                                        <h1 className="text-3xl text-white font-bold">
                                            Dua Collection
                                        </h1>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        <div className="md:hidden">
                            <button className='text-gray-400 cursor-pointer hover:text-gray-500' onClick={() => setNavbar(!navbar)}>
                                {navbar ? (
                                    <i className="block h-6 w-6">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                    </i>
                                ) : (
                                    <i className="block h-4 w-4">
                                        <svg viewBox="0 0 20 20" className='fill-current' xmlns="http://www.w3.org/2000/svg">
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
                    <div
                        className={`flex-1 justify-self-center pb-3 mt-8 md:block md:pb-0 md:mt-0 ${navbar ? "block" : "hidden"
                            }`}
                    >
                        <ul className="items-center justify-center space-y-8 md:flex md:space-x-6 md:space-y-0">
                            {menu.map(({ name, url }, index) => {
                                const isActive = pathname === url;
                                return (
                                    <li key={index} className={
                                        `block text-sm font-semibold text-gray-400 hover:bg-indigo-50 active:bg-indigo-100 hover:text-indigo-600 rounded ${isActive && "text-indigo-50"}`
                                    }>
                                        <Link className='block w-full p-4' onClick={() => setNavbar((prev) => prev ? false : prev)} href={url}>{name}</Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
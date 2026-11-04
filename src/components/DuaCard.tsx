'use client';

import { FC, useLayoutEffect, useRef } from 'react';

import { Amiri_Quran } from 'next/font/google';
import Link from 'next/link';

interface DuaCardProps {
  content: string;
  category: string;
  title: string;
  tags: string[];
  referenceLink: string;
  translation?: string;
}
const isArabic = (text: string) => {
  const pattern = /[\u0600-\u06FF\u0750-\u077F]/;
  return pattern.test(text);
};

const ArabicFont = Amiri_Quran({ weight: '400', subsets: ['arabic'] });
const DuaCard: FC<DuaCardProps> = ({ category, content, referenceLink, tags, title, translation }) => {
  const duaRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (duaRef.current) {
      const text = duaRef.current.innerText;
      if (text && isArabic(text)) {
        duaRef.current.setAttribute('dir', 'rtl');
      }
    }
  }, []);

  return (
    <div className="flex flex-col justify-center">
      <div className="flex flex-col h-full bg-card shadow justify-between rounded-lg pb-8 p-6 xl:p-8 mt-3 bg-gray-50">
        <div>
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">{category}</div>
          <h4 className="font-bold sm:text-2xl text-xl mt-6 leading-tight">{title}</h4>
          <div className="mt-6 mb-6">
            <p className="mb-5 sm:text-xl text-base !font-bold text-end" style={ArabicFont.style}>
              {content}
            </p>
            <p className="sm:text-base text-sm" ref={duaRef}>
              {translation}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Link key={index} href={{ query: { tag } }}>
                <span className="inline-block bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full px-4 py-1 !text-xs font-semibold">
                  {tag}
                </span>
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-2">
          <Link
            className="mt-1 inline-flex gap-2 font-bold items-center border-2 border-transparent outline-none focus:ring-1 focus:ring-offset-2 focus:ring-link active:bg-link active:text-gray-700 active:ring-0 active:ring-offset-0 leading-normal bg-link text-gray-700 hover:bg-opacity-80 text-sm rounded-lg py-1.5"
            aria-label="Quick Start"
            target="_blank"
            rel="noopener noreferrer"
            href={referenceLink}
          >
            <span>Read More</span>
            <i className="h-4 w-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M20 14a1 1 0 0 0-1 1v3.077c0 .459-.022.57-.082.684a.363.363 0 0 1-.157.157c-.113.06-.225.082-.684.082H5.923c-.459 0-.571-.022-.684-.082a.363.363 0 0 1-.157-.157c-.06-.113-.082-.225-.082-.684L4.999 5.5a.5.5 0 0 1 .5-.5l3.5.005a1 1 0 1 0 .002-2L5.501 3a2.5 2.5 0 0 0-2.502 2.5v12.577c0 .76.083 1.185.32 1.627.223.419.558.753.977.977.442.237.866.319 1.627.319h12.154c.76 0 1.185-.082 1.627-.319.419-.224.753-.558.977-.977.237-.442.319-.866.319-1.627V15a1 1 0 0 0-1-1zm-2-9.055v-.291l-.39.09A10 10 0 0 1 15.36 5H14a1 1 0 1 1 0-2l5.5.003a1.5 1.5 0 0 1 1.5 1.5V10a1 1 0 1 1-2 0V8.639c0-.757.086-1.511.256-2.249l.09-.39h-.295a10 10 0 0 1-1.411 1.775l-5.933 5.932a1 1 0 0 1-1.414-1.414l5.944-5.944A10 10 0 0 1 18 4.945z"
                  fill="currentColor"
                />
              </svg>
            </i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DuaCard;

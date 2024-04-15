'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import Bismillah from 'components/Bismillah';
import Dua from 'components/Dua';

import allDuas from 'duas.json';

const DuasPage = () => {
  const searchParams = useSearchParams();
  const duas = useMemo(() => {
    const tagFilter = searchParams.get('tag');
    if (tagFilter == null) {
      return allDuas;
    }

    const _filteredDuas = allDuas.filter(dua => {
      return dua.tags.includes(tagFilter);
    });
    return _filteredDuas;
  }, [searchParams]);

  const dTags = useMemo(() => {
    return allDuas
      .flatMap(d => d.tags)
      .filter((value, index, array) => {
        return array.indexOf(value) === index;
      });
  }, []);

  const [activeElement, setActiveElement] = useState('');
  const handleClick = (value: string) => {
    if (value === activeElement) {
      setActiveElement('');
    } else {
      setActiveElement(value);
    }
  };

  return (
    <section className="relative my-8 sm:my-10 grid grid-cols-1 gap-x-8 gap-y-4 p-6 mx-auto md:max-w-7xl">
      <div className="sticky top-0 z-20 bg-gray-100 mb-10 shadow-sm p-2">
        <div id="accordion-collapse" data-accordion="collapse">
          <h2 id="accordion-collapse-heading-1">
            <button
              type="button"
              onClick={() => handleClick('1')}
              className="flex items-center justify-between w-full p-2 font-medium rtl:text-right text-gray-500 border border-b-0 border-gray-200 hover:bg-gray-100 gap-3"
              data-accordion-target="#accordion-collapse-body-1"
              aria-expanded="true"
              aria-controls="accordion-collapse-body-1"
            >
              <span className="font-semibold">Filter by Category:</span>
              <svg
                data-accordion-icon
                className="w-3 h-3 rotate-180 shrink-0"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5 5 1 1 5"
                />
              </svg>
            </button>
          </h2>
          <div
            id="accordion-collapse-body-1"
            className={activeElement === '1' ? '' : 'hidden'}
            aria-labelledby="accordion-collapse-heading-1"
          >
            <ul className="flex flex-wrap items-center justify-start">
              {dTags.map((tag, ix) => {
                const isActive = tag === searchParams.get('tag');
                return (
                  <li
                    key={ix}
                    className={`text-xs font-medium mx-1 my-1 text-gray-500 active:bg-indigo-100 hover:text-indigo-600 rounded ${isActive && 'text-indigo-600'}`}
                  >
                    <Link className="px-1" href={{ pathname: '/Duas', query: { tag: tag } }}>
                      {tag}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
      <Bismillah />
      {duas.map((dua, index) => (
        <Dua
          key={index}
          title={dua.title}
          content={dua.content}
          category={dua.tags.includes('Quran') ? 'Quranic Dua' : dua.tags.includes('Masnoon') ? 'Masnoon Dua' : ''}
          tags={dua.tags}
          referenceLink={dua.referenceLink}
          translation={dua.translation}
        />
      ))}
    </section>
  );
}

export default DuasPage

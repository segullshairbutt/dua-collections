import React, { MouseEventHandler, useMemo, useState } from 'react';

import Link from 'next/link';

import allDuas from 'duas.json';

interface CategoriesProps {
  tagParam?: string | null;
}

const Categories = ({ tagParam }: CategoriesProps) => {
  const [accordion, setAccordion] = useState(false);
  const toggleAccordion = () => setAccordion(prev => !prev);

  const duaTags = useMemo(() => {
    return allDuas
      .flatMap(d => d.tags)
      .filter((value, index, array) => {
        return array.indexOf(value) === index;
      });
  }, []);

  return (
    <div className="sticky top-0 z-20 bg-gray-100 mb-0 shadow-sm mt-10 p-2">
      <div id="accordion-collapse" data-accordion="collapse">
        <h2 id="accordion-collapse-heading-1">
          <button
            type="button"
            onClick={toggleAccordion}
            className="flex items-center justify-between w-full p-2 font-medium rtl:text-right text-gray-500 hover:bg-gray-100 gap-3"
            data-accordion-target="#accordion-collapse-body-1"
            aria-controls="accordion-collapse-body-1"
            aria-expanded="true"
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
          className={accordion ? '' : 'hidden'}
          aria-labelledby="accordion-collapse-heading-1"
        >
          <ul className="flex flex-wrap items-center justify-start">
            {duaTags.map((tag, ix) => (
              <Category key={ix} isActive={tag === tagParam} tag={tag} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Categories;

interface CategoryLinkProps {
  tag: string;
  isActive?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  activeClassName?: string;
}

export const Category = ({ tag, isActive, onClick, activeClassName = 'text-indigo-600' }: CategoryLinkProps) => {
  return (
    <li
      className={`text-xs font-medium mx-1 my-1 text-gray-500 active:bg-indigo-100 hover:text-indigo-600 rounded ${isActive ? activeClassName : ''}`}
    >
      <Link className="px-1" onClick={onClick} href={{ pathname: '/Duas', query: { tag: tag } }}>
        {tag}
      </Link>
    </li>
  );
};

'use client';

import { useMemo } from 'react';

import { useSearchParams } from 'next/navigation';

import Bismillah from 'components/Bismillah';
import Categories from 'components/Categories';
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

  return (
    <section className="relative my-8 sm:my-10 grid grid-cols-1 gap-x-8 gap-y-4 p-6 mx-auto md:max-w-7xl">
      <Bismillah />
      <Categories tagParam={searchParams.get('tag')} />
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
};

export default DuasPage;

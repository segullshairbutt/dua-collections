'use client';

import { useMemo } from 'react';

import { useSearchParams } from 'next/navigation';

import Bismillah from 'components/Bismillah';
import Categories from 'components/Categories';
import DuaCard from 'components/DuaCard';

import allDuas from 'duas.json';

const DuasPage = () => {
  const searchParams = useSearchParams();
  const tagFilter = searchParams.get('tag');

  const filteredDuas = useMemo(
    () => (tagFilter == null ? allDuas : allDuas.filter(dua => dua.tags.includes(tagFilter))),
    [tagFilter]
  );

  const duaTags = useMemo(() => {
    return allDuas
      .flatMap(d => d.tags)
      .filter((value, index, array) => {
        return array.indexOf(value) === index;
      });
  }, []);

  return (
    <section className="relative my-8 sm:my-10 grid grid-cols-1 gap-x-8 gap-y-4 p-6 mx-auto md:max-w-7xl">
      <Bismillah />
      <Categories allTags={duaTags} tagParam={tagFilter} />
      {filteredDuas.map((dua, index) => (
        <DuaCard
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

'use client';

import { FC, Suspense, useEffect, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import Bismillah from 'components/Bismillah';
import Dua from 'components/Dua';

import allDuas from './duas.json';

interface DuaObject {
  id: string;
  title: string;
  translation: string;
  content: string;
  tags: string[];
  referenceLink: string;
}

const Duas: FC = () => {
  const searchParams = useSearchParams();
  const [duas, setDuas] = useState<DuaObject[]>([]);

  useEffect(() => {
    const tagFilter = searchParams.get('tag');
    if (tagFilter == null) {
      setDuas(allDuas);
      return;
    }

    const _filteredDuas = allDuas.filter(dua => {
      return dua.tags.includes(tagFilter);
    });
    setDuas(_filteredDuas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <section className="my-8 sm:my-10 grid grid-cols-1 gap-x-8 gap-y-4 p-6 mx-auto md:max-w-7xl">
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
};

export default function DuasPage() {
  return (
    <Suspense>
      <Duas />
    </Suspense>
  );
}

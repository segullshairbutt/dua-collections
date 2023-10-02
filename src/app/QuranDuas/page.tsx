import { FC } from "react";

import Dua from "components/Dua";

import Duas from "./duas.json";

const QuranDuas: FC = () => {
  return (
    <div className="relative overflow-hidden pt-16 pb-32 space-y-24 min-h-[calc(100vh_-_156px)]">
      <section className="my-8 sm:my-10 grid grid-cols-1 gap-x-8 gap-y-4 p-6 mx-auto md:max-w-7xl">
        <h1 className="font-bold text-center text-3xl leading-tight">
          ﷽
        </h1>
        {Duas.map((dua, index) => (
          <Dua
            key={index}
            title={dua.title}
            content={dua.content}
            category="Quranic Dua"
            tags={dua.tags}
            referenceLink={dua.referenceLink}
            translation={dua.translation}
          />
        ))}
      </section>
    </div>
  )
};

export default QuranDuas;

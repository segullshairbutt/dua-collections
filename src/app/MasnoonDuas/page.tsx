import { FC } from "react";

import Bismillah from "components/Bismillah";
import Dua from "components/Dua";

import Duas from "./duas.json";

const MasnoonDuas: FC = () => {
  return (
    <section className="my-8 sm:my-10 grid grid-cols-1 gap-x-8 gap-y-4 p-6 mx-auto md:max-w-7xl">
      <Bismillah />
      {Duas.map((dua, index) => (
        <Dua
          key={index}
          title={dua.title}
          content={dua.content}
          category="Masnoon Dua"
          tags={dua.tags}
          referenceLink={dua.referenceLink}
          translation={dua.translation}
        />
      ))}
    </section>
  )
};

export default MasnoonDuas;

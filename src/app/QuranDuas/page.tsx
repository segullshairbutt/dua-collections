import { FC } from "react";
import DuaCard from "@/app/components/DuaCard/DuaCard";

import Duas from "./duas.json";

const QuranDuas: FC = () => {
  return (
    <div>
      {Duas.map((dua, index) => (
        <DuaCard
          key={index}
          title={dua.title}
          content={dua.content}
          category="Quranic Dua"
          tags={dua.tags}
          referenceLink={dua.referenceLink}
          translation={dua.translation}
        />
      ))}
    </div>
  );
};

export default QuranDuas;

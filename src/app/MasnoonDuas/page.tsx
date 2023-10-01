import { FC } from "react";
import DuaCard from "../components/DuaCard/DuaCard";

import Duas from "./duas.json";

const MasnoonDuas: FC = () => {
  return (
    <div>
      {Duas.map((dua, index) => (
        <DuaCard
          key={index}
          title={dua.title}
          content={dua.content}
          category="Masnoon Dua"
          tags={dua.tags}
          referenceLink={dua.referenceLink}
          translation={dua.translation}
        />
      ))}
    </div>
  );
};

export default MasnoonDuas;

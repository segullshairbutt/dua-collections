import AlQuran from "components/AlQuran";
import Hadith from "components/Hadith";
import Section from "components/Section";

import QuranIcon from "public/quran.webp";
import HadithIcon from "public/hadith.webp";

export default function Home() {
  return (
    <div className="relative overflow-hidden pt-16 pb-32 space-y-24 min-h-[calc(100vh_-_156px)]">
      <Section
        title="Quranic Duas"
        image={QuranIcon}
        description="A comprehensive list of all the Duas from the Quran with detailed explanations and translations of each Dua, you can deepen your understanding of the Quran and strengthen your connection with Allah."
        link="/QuranDuas"
        icon={
          <AlQuran />
        }
      />
      <Section
        title="Masnoon Duas"
        image={HadithIcon}
        description="A comprehensive list of all the Duas from Hadith and Sunnah with detailed explanations and translations of each Dua, you can deepen your understanding of Islamic teachings and strengthen your connection with Allah and his Prophet (P.B.U.H)"
        link="/MasnoonDuas"
        icon={
          <Hadith />
        }
      />
    </div>
  )
}

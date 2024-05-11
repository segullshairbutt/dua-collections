import Section from 'components/Section';

import HadithIcon from 'icons/HadithIcon';
import QuranIcon from 'icons/QuranIcon';

import Hadith from 'public/hadith.webp';
import Quran from 'public/quran.webp';

export default function Home() {
  return (
    <div className="space-y-24 overflow-x-hidden">
      <Section
        title="Quranic Duas"
        image={Quran}
        description="A comprehensive list of all the Duas from the Quran with detailed explanations and translations of each Dua, you can deepen your understanding of the Quran and strengthen your connection with Allah."
        href={{ pathname: 'Duas', query: { tag: 'Quran' } }}
        icon={<QuranIcon />}
        imgProps={{ priority: true }}
      />
      <Section
        title="Masnoon Duas"
        image={Hadith}
        description="A comprehensive list of all the Duas from Hadith and Sunnah with detailed explanations and translations of each Dua, you can deepen your understanding of Islamic teachings and strengthen your connection with Allah and his Prophet (P.B.U.H)"
        href={{ pathname: '/Duas', query: { tag: 'Masnoon' } }}
        imgProps={{ loading: 'lazy', priority: false }}
        icon={<HadithIcon />}
      />
    </div>
  );
}

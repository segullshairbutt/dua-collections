import { Amiri } from 'next/font/google';

const ArabicFont = Amiri({ weight: '400', subsets: ['arabic'] });
const Bismillah = () => {
  return (
    <h1 className="font-bold text-center sm:text-3xl text-2xl leading-tight" style={ArabicFont.style}>
      ﷽
    </h1>
  );
};

export default Bismillah;

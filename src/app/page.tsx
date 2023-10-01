import Image from "next/image";
import Link from "next/link";
import { FC } from "react";

export default function Home() {
  return (
    <div className="flex flex-wrap space-x-5 items-center justify-center">
      <Button link="QuranDuas" text="Quranic Duas" imageUrl="/quran-icon.jpg" />
      <Button link="MasnoonDuas" text="Masnoon Duas" imageUrl="hadith.png" />
    </div>
  );
}

interface ButtonProps {
  link: string;
  text: string;
  imageUrl: string;
}
const Button: FC<ButtonProps> = ({ link, text, imageUrl }) => {
  return (
    <div className="transform hover:scale-105 transition-transform">
      <Link href={link}>
        <div className="flex flex-col items-center justify-center">
          <button className="relative bg-transparent text-gray-800 hover:text-gray-900 border border-gray-300 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring focus:ring-opacity-50">
            <div
              className="w-64 h-32 bg-cover bg-center rounded-lg"
              style={{
                backgroundImage: 'url("' + imageUrl + '")',
              }}
            />
            <p className="mt-2 text-center">{text}</p>
          </button>
        </div>
      </Link>
    </div>
  );
};

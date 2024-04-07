import { ReactElement } from 'react';

import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';

import { UrlObject } from 'url';

interface SectionProps {
  href: UrlObject;
  title: string;
  description: string;
  icon: ReactElement;
  image: StaticImageData;
}

const Section = ({ description, icon, href, title, image }: SectionProps) => {
  return (
    <div className="relative">
      <div className="md:mx-auto md:grid md:max-w-7xl md:grid-flow-col-dense md:grid-cols-2 md:gap-24 md:px-8">
        <div className="mx-auto max-w-xl px-6 md:mx-0 md:max-w-none md:py-16 md:px-0">
          <div>
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500">
                <i className="h-8 w-8 text-white">{icon}</i>
              </span>
            </div>

            <div className="mt-6">
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">{title}</h2>
              <p className="mt-4 text-lg text-gray-400">{description}</p>
              <div className="mt-6">
                <Link
                  className="inline-flex rounded-lg bg-indigo-600 px-4 py-1.5 text-white font-semibold leading-7 shadow-sm ring-1 ring-indigo-600 hover:bg-indigo-700 hover:ring-indigo-700"
                  href={href}
                >
                  Read More
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 sm:mt-16 md:mt-0 md:block hidden">
          <div className="-mr-48 pl-6 md:-mr-16 md:relative md:m-0 md:h-full md:px-0">
            <Image
              loading="lazy"
              width="647"
              height="486"
              className="w-full rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 md:absolute md:left-0 md:h-full md:w-auto md:max-w-none"
              src={image}
              alt={title}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Section;

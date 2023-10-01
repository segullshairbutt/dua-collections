import { FC } from "react";

interface DuaCardProps {
  content: string;
  category: string;
  title: string;
  tags: string[];
  referenceLink: string;
  translation?: string;
}

const DuaCard: FC<DuaCardProps> = ({
  content,
  category,
  title,
  tags,
  referenceLink,
  translation,
}) => {
  return (
    <div className="mx-auto bg-white rounded-xl overflow-hidden shadow-lg">
      <div className="md:flex">
        <div className="p-8">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
            {category}
          </div>
          <a
            href="#"
            className="block mt-1 text-lg leading-tight font-medium text-black hover:underline"
          >
            {title}
          </a>
          <p className="mt-2 text-gray-700 text-right">{content}</p>
          <p className="mt-2 text-gray-500 text-right">{translation}</p>
          <div className="mt-4">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full px-3 py-1 text-xs font-semibold mr-2 mb-2"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-4">
            <a
              href={referenceLink}
              className="text-indigo-600 hover:underline hover:text-indigo-800"
            >
              Read More
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DuaCard;

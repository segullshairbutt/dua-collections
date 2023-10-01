import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="bg-gray-100 p-4">
      <div className="flex items-center justify-between">
        <Link href="/">
          <div className="text-xl font-semibold">Dua Collection</div>
        </Link>
        <ul
          className={`flex space-x-4 block mt-4 md:mt-0 text-gray-600 md:text-gray-900`}
        >
          <li>
            <Link href="/QuranDuas">
              <p className="flex items-center space-x-2">
                <span>Quranic Duas</span>
              </p>
            </Link>
          </li>
          <li>
            <Link href="/MasnoonDuas">
              <p className="flex items-center space-x-2">
                <span>Masnoon Duas</span>
              </p>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

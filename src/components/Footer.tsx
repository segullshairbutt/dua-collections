import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-600 py-4">
      <div className="container mx-auto text-center">
        <p>&copy; 2024 Dua Collection. All Rights Reserved.</p>
        <div className="mt-4">
          {/* Social Media Links */}
          <Link
            href="https://github.com/segullshairbutt"
            target="_blank"
            rel="noopener noreferrer"
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            GitHub
          </Link>
          <Link
            href="https://linkedin.com/in/gulshairbutt"
            target="_blank"
            rel="noopener noreferrer"
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            LinkedIn
          </Link>
          {/* Add more social media links as needed */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;

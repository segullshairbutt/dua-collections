const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-600 py-4">
      <div className="container mx-auto text-center">
        <p>&copy; 2023 Your App. All Rights Reserved.</p>
        <div className="mt-4">
          {/* Social Media Links */}
          <a
            href="https://github.com/yourusername"
            target="_blank"
            rel="noopener noreferrer"
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/yourusername"
            target="_blank"
            rel="noopener noreferrer"
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            LinkedIn
          </a>
          {/* Add more social media links as needed */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;

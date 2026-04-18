import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="mx-auto max-w-xl py-20 text-center">
      <h1 className="text-4xl font-bold text-dark-brown">404</h1>
      <p className="mt-3 text-warm-taupe">The page you requested could not be found.</p>
      <Link to="/" className="mt-6 inline-block rounded-md bg-dark-brown px-4 py-2 text-sm font-medium text-white">
        Back to home
      </Link>
    </div>
  );
};

export default NotFoundPage;

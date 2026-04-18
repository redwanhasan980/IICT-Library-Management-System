import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <div className="mx-auto max-w-xl py-20 text-center">
      <h1 className="text-3xl font-bold text-dark-brown">Access Denied</h1>
      <p className="mt-3 text-warm-taupe">
        Your account does not have permission to access this page.
      </p>
      <Link to="/dashboard" className="mt-6 inline-block rounded-md bg-dark-brown px-4 py-2 text-sm font-medium text-white">
        Go to Dashboard
      </Link>
    </div>
  );
};

export default UnauthorizedPage;

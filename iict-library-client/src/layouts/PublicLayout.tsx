import { Outlet } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-pale-cream/40 px-4 py-8">
      <div className="mx-auto w-full max-w-5xl rounded-xl border border-sandy-beige bg-white p-6 shadow-sm">
        <Outlet />
      </div>
    </div>
  );
};

export default PublicLayout;

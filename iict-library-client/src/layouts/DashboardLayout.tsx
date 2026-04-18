import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-pale-cream/40">
      <div className="mx-auto flex w-full max-w-7xl gap-4 px-4 py-4">
        <Sidebar />
        <main className="min-h-[calc(100vh-2rem)] flex-1 rounded-lg border border-sandy-beige bg-white p-6 shadow-sm">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

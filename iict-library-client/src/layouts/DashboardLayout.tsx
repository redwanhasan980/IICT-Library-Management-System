import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pale-cream/60 via-white to-library-mist/40">
      <div className="w-full px-4 sm:px-6 lg:px-10 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-warm-taupe">Library Workspace</p>
            <h1 className="text-2xl font-semibold text-library-ink">IICT Library</h1>
          </div>
          <button
            type="button"
            aria-label="Open navigation"
            className="rounded-full border border-sandy-beige/70 bg-white/90 p-3 shadow-sm transition hover:bg-library-mist/60"
            onClick={() => setIsSidebarOpen(true)}
          >
            <span className="block h-0.5 w-6 rounded-full bg-library-ink" />
            <span className="mt-1.5 block h-0.5 w-4 rounded-full bg-library-ink" />
            <span className="mt-1.5 block h-0.5 w-5 rounded-full bg-library-ink" />
          </button>
        </div>

        <div className="flex gap-6">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          <main className="min-h-[calc(100vh-8rem)] flex-1 rounded-3xl border border-sandy-beige/70 bg-white/90 p-8 shadow-[0_20px_50px_rgba(22,35,28,0.12)] backdrop-blur">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

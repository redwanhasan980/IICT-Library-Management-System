import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-pale-cream/60 via-white to-library-mist/40">
      <Header />
      <main className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto mb-4 flex max-w-7xl justify-end">
          <button
            type="button"
            aria-label="Open all dashboard modules"
            className="inline-flex items-center gap-2 rounded-full border border-sandy-beige/70 bg-white/90 px-4 py-2 text-sm font-semibold text-library-ink shadow-sm transition hover:bg-library-mist/70"
            onClick={() => setIsSidebarOpen(true)}
          >
            <span className="grid gap-1" aria-hidden="true">
              <span className="block h-1 w-1 rounded-full bg-library-ink" />
              <span className="block h-1 w-1 rounded-full bg-library-ink" />
              <span className="block h-1 w-1 rounded-full bg-library-ink" />
            </span>
            All modules
          </button>
        </div>
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <section className="mx-auto min-h-[calc(100vh-14rem)] max-w-7xl rounded-3xl border border-sandy-beige/70 bg-white/90 p-5 shadow-[0_20px_50px_rgba(22,35,28,0.12)] backdrop-blur sm:p-8">
          <Outlet />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardLayout;

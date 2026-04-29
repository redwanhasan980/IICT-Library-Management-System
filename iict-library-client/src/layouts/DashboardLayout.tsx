import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-pale-cream/60 via-white to-library-mist/40">
      <Header onOpenModules={() => setIsSidebarOpen(true)} />
      <main className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-10">
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

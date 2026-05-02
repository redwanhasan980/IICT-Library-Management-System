import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="w-full flex-1 px-3 py-5 sm:px-5 lg:px-8">
        <section className="paper-surface mx-auto min-h-[calc(100vh-14rem)] max-w-7xl overflow-hidden p-4 sm:p-6 lg:p-8">
          <Outlet />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardLayout;

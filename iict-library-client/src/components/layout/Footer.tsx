import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { selectCurrentUser } from '../../services/auth.slice';
import { Role } from '../../types/user.types';

type FooterLink = {
  to: string;
  label: string;
};

const Footer = () => {
  const user = useAppSelector(selectCurrentUser);
  const year = new Date().getFullYear();

  const borrowingLink =
    user?.role === Role.STUDENT
      ? '/dashboard/student/borrowing'
      : user?.role === Role.TEACHER
        ? '/dashboard/teacher/borrowing'
        : '/login';

  const quickLinks: FooterLink[] = [
    { to: '/', label: 'Home' },
    { to: user ? '/dashboard/books' : '/catalog', label: 'Catalog / Search Books' },
    { to: borrowingLink, label: 'Borrowing History' },
  ];

  if (user?.role === Role.STUDENT) {
    quickLinks.push({ to: '/dashboard/add-outside-book', label: 'Outside Book Entry' });
  }

  if (user?.role === Role.ADMIN) {
    quickLinks.push({ to: '/dashboard/admin/reports', label: 'Reports' });
    quickLinks.push({ to: '/dashboard/admin/audit-logs', label: 'Audit Logs' });
  }

  return (
    <footer className="border-t border-library-forest/20 bg-library-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">IICT Library Management System</h2>
          <p className="text-sm leading-6 text-white/75">Digital library system for IICT academic resources.</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-library-gold">Quick Links</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            {quickLinks.map((link) => (
              <li key={`${link.to}-${link.label}`}>
                <Link to={link.to} className="transition hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-library-gold">Services</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            <li>Book Search</li>
            <li>Book Borrowing</li>
            <li>Book Return</li>
            <li>Outside Book Monitoring</li>
            <li>DDC Classification / Spine Labeling</li>
            <li>Reports</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-library-gold">Institution</h3>
          <div className="mt-4 space-y-2 text-sm leading-6 text-white/75">
            <p className="text-white/75">Institute of Information and Communication Technology</p>
            <p className="text-white/75">Shahjalal University of Science and Technology, Sylhet</p>
            <p className="text-white/75">Library hours: update by admin</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/65">
        Copyright {year} IICT Library Management System
      </div>
    </footer>
  );
};

export default Footer;

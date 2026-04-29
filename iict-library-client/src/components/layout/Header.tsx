import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { useLogoutMutation } from '../../services/auth.api';
import { logOut, selectCurrentUser } from '../../services/auth.slice';
import { Role } from '../../types/user.types';

type NavItem = {
  to: string;
  label: string;
};

const publicLinks: NavItem[] = [
  { to: '/', label: 'Home' },
  { to: '/catalog', label: 'Catalog' },
  { to: '/about', label: 'About Library' },
  { to: '/login', label: 'Login' },
  { to: '/register', label: 'Register' },
];

const studentLinks: NavItem[] = [
  { to: '/dashboard/student', label: 'Dashboard' },
  { to: '/dashboard/books', label: 'Catalog' },
  { to: '/dashboard/student/borrowing', label: 'My Borrowing' },
  { to: '/dashboard/add-outside-book', label: 'Outside Book Entry' },
  { to: '/dashboard/profile', label: 'Profile' },
];

const teacherLinks: NavItem[] = [
  { to: '/dashboard/teacher', label: 'Dashboard' },
  { to: '/dashboard/books', label: 'Catalog' },
  { to: '/dashboard/teacher/borrowing', label: 'My Borrowing' },
  { to: '/dashboard/profile', label: 'Profile' },
];

const adminLinks: NavItem[] = [
  { to: '/dashboard/admin', label: 'Admin Dashboard' },
  { to: '/dashboard/admin/catalog', label: 'Book Management' },
  { to: '/dashboard/admin/circulation', label: 'Circulation' },
  { to: '/dashboard/admin/outside-book-logs', label: 'Outside Book Logs' },
  { to: '/dashboard/admin/reports', label: 'Reports' },
  { to: '/dashboard/admin/procurement', label: 'Procurement' },
  { to: '/dashboard/admin/users', label: 'Members' },
  { to: '/dashboard/admin/inventory-audit', label: 'Inventory' },
  { to: '/dashboard/admin/audit-logs', label: 'Audit' },
  { to: '/dashboard/profile', label: 'Profile' },
];

const getLinksForRole = (role?: Role) => {
  if (role === Role.ADMIN) {
    return adminLinks;
  }
  if (role === Role.STUDENT) {
    return studentLinks;
  }
  if (role === Role.TEACHER) {
    return teacherLinks;
  }
  return publicLinks;
};

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? 'bg-library-forest text-white shadow-sm'
      : 'text-library-ink/80 hover:bg-library-mist hover:text-library-ink'
  }`;

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logout, { isLoading }] = useLogoutMutation();
  const links = getLinksForRole(user?.role);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } finally {
      dispatch(logOut());
      setIsProfileOpen(false);
      setIsMenuOpen(false);
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-sandy-beige/70 bg-pale-cream/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex min-h-[72px] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3" onClick={() => setIsMenuOpen(false)}>
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-library-forest text-sm font-bold text-white shadow-sm">
            IICT
          </span>
          <span>
            <span className="block text-base font-bold text-library-ink sm:text-lg">IICT Library</span>
            <span className="block text-xs font-medium uppercase tracking-[0.16em] text-warm-taupe">Library Management System</span>
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-1 xl:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          {user ? (
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-3 rounded-full border border-sandy-beige bg-white/80 px-3 py-2 text-left shadow-sm transition hover:bg-white"
                onClick={() => setIsProfileOpen((open) => !open)}
                aria-expanded={isProfileOpen}
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-library-mist text-sm font-bold text-library-ink">
                  {(user.name || user.email).slice(0, 1).toUpperCase()}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-library-ink">{user.name || user.email}</span>
                  <span className="block text-xs text-warm-taupe">{user.role}</span>
                </span>
              </button>
              {isProfileOpen ? (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-sandy-beige bg-white p-3 shadow-[0_18px_40px_rgba(22,35,28,0.14)]">
                  <p className="truncate px-2 text-sm font-semibold text-library-ink">{user.email}</p>
                  <p className="px-2 text-xs text-warm-taupe">{user.role}</p>
                  <div className="my-3 h-px bg-sandy-beige/80" />
                  <NavLink
                    to="/dashboard/profile"
                    className="block rounded-xl px-3 py-2 text-sm font-medium text-library-ink hover:bg-library-mist"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Profile
                  </NavLink>
                  <button
                    type="button"
                    className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                    onClick={handleLogout}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing out...' : 'Logout'}
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          className="rounded-full border border-sandy-beige bg-white/80 p-3 shadow-sm transition hover:bg-library-mist xl:hidden"
          aria-label="Toggle navigation"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span className="block h-0.5 w-6 rounded-full bg-library-ink" />
          <span className="mt-1.5 block h-0.5 w-6 rounded-full bg-library-ink" />
          <span className="mt-1.5 block h-0.5 w-6 rounded-full bg-library-ink" />
        </button>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-sandy-beige/70 bg-pale-cream px-4 py-4 shadow-sm xl:hidden">
          <nav aria-label="Mobile navigation" className="mx-auto grid max-w-7xl gap-2 sm:grid-cols-2">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
                {link.label}
              </NavLink>
            ))}
            {user ? (
              <button
                type="button"
                className="rounded-full px-3 py-2 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                onClick={handleLogout}
                disabled={isLoading}
              >
                {isLoading ? 'Signing out...' : 'Logout'}
              </button>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
};

export default Header;

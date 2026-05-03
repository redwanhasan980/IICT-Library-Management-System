import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { useLogoutMutation } from '../../services/auth.api';
import { logOut, selectCurrentUser } from '../../services/auth.slice';
import { Role } from '../../types/user.types';

type NavItem = {
  to: string;
  label: string;
  end?: boolean;
};

const publicLinks: NavItem[] = [
  { to: '/', label: 'Home', end: true },
  { to: '/catalog', label: 'Catalog' },
  { to: '/about', label: 'About Library' },
  { to: '/login', label: 'Login' },
  // Institution-only deployment: keep /register implemented, but hide this link.
  // { to: '/register', label: 'Register' },
];

const studentLinks: NavItem[] = [
  { to: '/dashboard/student', label: 'Dashboard', end: true },
  { to: '/dashboard/books', label: 'Catalog' },
  { to: '/dashboard/student/borrowing', label: 'My Borrowing' },
  { to: '/dashboard/add-outside-book', label: 'Outside Book Entry' },
  { to: '/dashboard/profile', label: 'Profile' },
];

const teacherLinks: NavItem[] = [
  { to: '/dashboard/teacher', label: 'Dashboard', end: true },
  { to: '/dashboard/books', label: 'Catalog' },
  { to: '/dashboard/teacher/borrowing', label: 'My Borrowing' },
  { to: '/dashboard/profile', label: 'Profile' },
];

const adminLinks: NavItem[] = [
  { to: '/dashboard/admin', label: 'Admin', end: true },
  { to: '/dashboard/admin/catalog', label: 'Books' },
  { to: '/dashboard/admin/circulation', label: 'Circulation' },
  { to: '/dashboard/admin/outside-book-logs', label: 'Outside Logs' },
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
  `whitespace-nowrap border-2 px-2.5 py-2 text-[13px] font-extrabold uppercase leading-none tracking-[0.08em] transition ${
    isActive
      ? 'border-library-ink bg-library-ink text-pale-cream shadow-[3px_3px_0_#5e4447]'
      : 'border-transparent text-library-ink hover:border-library-ink hover:bg-library-mist'
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
    <header className="sticky top-0 z-40 border-b-2 border-library-ink bg-paper-soft/95 shadow-[4px_4px_0_#1a1c1a]">
      <div className="mx-auto flex min-h-[72px] w-full max-w-[1880px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3 min-[1800px]:w-[230px] min-[1800px]:flex-none">
          <Link to="/" className="flex min-w-0 items-center gap-3" onClick={() => setIsMenuOpen(false)}>
            <span className="grid h-11 w-11 shrink-0 place-items-center border-2 border-library-ink bg-library-ink text-sm font-extrabold text-pale-cream shadow-[3px_3px_0_#5e4447]">
              IICT
            </span>
            <span className="min-w-0 max-w-[220px] min-[1800px]:max-w-[155px]">
              <span className="block text-base font-bold text-library-ink sm:text-lg">IICT Library</span>
              <span className="block truncate text-xs font-medium uppercase tracking-[0.16em] text-warm-taupe">Library Management System</span>
            </span>
          </Link>
        </div>

        <nav aria-label="Primary navigation" className="hidden min-w-0 flex-1 items-center justify-center gap-1 min-[1800px]:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-3 min-[1800px]:flex">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center gap-3 border-2 border-library-ink bg-paper-soft px-3 py-2 text-left transition hover:bg-library-mist"
                  onClick={() => setIsProfileOpen((open) => !open)}
                  aria-expanded={isProfileOpen}
                >
                  <span className="grid h-9 w-9 place-items-center border-2 border-library-ink bg-library-mist text-sm font-bold text-library-ink">
                    {(user.name || user.email).slice(0, 1).toUpperCase()}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-library-ink">{user.name || user.email}</span>
                    <span className="block text-xs text-warm-taupe">{user.role}</span>
                  </span>
                </button>
                {isProfileOpen ? (
                  <div className="absolute right-0 mt-2 w-64 border-2 border-library-ink bg-paper-soft p-3 shadow-[6px_6px_0_#1a1c1a]">
                    <p className="truncate px-2 text-sm font-semibold text-library-ink">{user.email}</p>
                    <p className="px-2 text-xs text-warm-taupe">{user.role}</p>
                    <div className="my-3 h-px bg-sandy-beige/80" />
                    <NavLink
                      to="/dashboard/profile"
                      className="block border-2 border-transparent px-3 py-2 text-sm font-bold text-library-ink hover:border-library-ink hover:bg-library-mist"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Profile
                    </NavLink>
                    <button
                      type="button"
                      className="mt-1 w-full border-2 border-library-ink bg-rose-50 px-3 py-2 text-left text-sm font-bold text-rose-800 disabled:opacity-60"
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
            className="border-2 border-library-ink bg-paper-soft p-3 transition hover:bg-library-mist min-[1800px]:hidden"
            aria-label="Toggle navigation"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span className="block h-0.5 w-6 bg-library-ink" />
            <span className="mt-1.5 block h-0.5 w-6 bg-library-ink" />
            <span className="mt-1.5 block h-0.5 w-6 bg-library-ink" />
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div className="header-menu-panel border-t-2 border-library-ink bg-paper-soft px-4 py-4 shadow-[4px_4px_0_#1a1c1a] min-[1800px]:hidden">
          <nav aria-label="Mobile navigation" className="mx-auto grid max-w-7xl gap-2 sm:grid-cols-2">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
                {link.label}
              </NavLink>
            ))}
            {user ? (
              <button
                type="button"
                className="border-2 border-library-ink bg-rose-50 px-3 py-2 text-left text-sm font-bold text-rose-800 disabled:opacity-60"
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

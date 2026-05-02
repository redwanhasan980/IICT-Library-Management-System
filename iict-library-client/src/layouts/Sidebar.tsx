import { NavLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { logOut, selectCurrentUser } from '../services/auth.slice';
import { Role } from '../types/user.types';
import { Button } from '../components/shared/Button';
import { useLogoutMutation } from '../services/auth.api';

const commonLinks = [
  { to: '/dashboard', label: 'Dashboard' },
];

const adminLinks = [
  { to: '/dashboard/books', label: 'Book Catalog' },
  { to: '/dashboard/admin/catalog', label: 'Manage Books' },
  { to: '/dashboard/admin/users', label: 'Members' },
  { to: '/dashboard/outside-book-log', label: 'Outside Book Log' },
  { to: '/dashboard/admin/outside-book-logs', label: 'Outside Book Logs' },
  { to: '/dashboard/admin/circulation', label: 'Circulation Desk' },
  { to: '/dashboard/admin/procurement', label: 'Procurement' },
  { to: '/dashboard/admin/reservations', label: 'Reservations' },
  { to: '/dashboard/admin/settings', label: 'System Settings' },
  { to: '/dashboard/admin/bulk-tools', label: 'Bulk Tools' },
  { to: '/dashboard/admin/inventory-audit', label: 'Inventory Audit' },
  { to: '/dashboard/admin/fines', label: 'Fine Management' },
  { to: '/dashboard/admin/analytics', label: 'Analytics' },
  { to: '/dashboard/admin/reports', label: 'Reports' },
  { to: '/dashboard/admin/audit-logs', label: 'Audit Logs' },
  { to: '/dashboard/spine-label-generator', label: 'Spine Label Generator' },
  // Add other admin links here
];

const studentLinks = [
  { to: '/dashboard/books', label: 'Book Catalog' },
  { to: '/dashboard/student/borrowing', label: 'My Borrowing' },
  { to: '/dashboard/student/reservations', label: 'My Reservations' },
  { to: '/dashboard/student/fines', label: 'My Fines' },
  { to: '/dashboard/my-outside-books', label: 'My Outside Books' },
  { to: '/dashboard/add-outside-book', label: 'Add Outside Book' },
  // Add other student links here
];

const teacherLinks = [
  { to: '/dashboard/books', label: 'Book Catalog' },
  { to: '/dashboard/teacher/borrowing', label: 'My Borrowing' },
  { to: '/dashboard/teacher/reservations', label: 'My Reservations' },
  { to: '/dashboard/teacher/fines', label: 'My Fines' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const [logout] = useLogoutMutation();

  const getLinksForRole = (role: Role | undefined) => {
    switch (role) {
      case Role.ADMIN:
        return [...commonLinks, ...adminLinks];
      case Role.STUDENT:
        return [...commonLinks, ...studentLinks];
      case Role.TEACHER:
        return [...commonLinks, ...teacherLinks];
      default:
        return commonLinks;
    }
  };

  const links = getLinksForRole(user?.role);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-library-ink/45 transition-opacity ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed right-4 top-4 z-50 h-[calc(100vh-2rem)] w-72 border-2 border-library-ink bg-pale-cream p-6 shadow-[8px_8px_0_#1a1c1a] transition-transform ${
          isOpen ? 'translate-x-0' : 'translate-x-[calc(100%+2rem)]'
        }`}
      >
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-warm-taupe">IICT</p>
            <h2 className="text-2xl font-bold text-library-ink">Library Suite</h2>
            <div className="mt-3 h-[3px] w-16 bg-library-ink" />
          </div>
          <button
            type="button"
            aria-label="Close navigation"
            className="border-2 border-library-ink bg-paper-soft px-3 py-1 text-sm font-extrabold text-library-ink"
            onClick={onClose}
          >
            X
          </button>
        </div>
        <nav>
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `block border-2 px-4 py-2.5 text-sm font-bold transition-all ${
                      isActive
                        ? 'border-library-ink bg-library-ink text-pale-cream shadow-[3px_3px_0_#5e4447]'
                        : 'border-transparent text-warm-taupe hover:border-library-ink hover:bg-library-mist hover:text-library-ink'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {user ? (
          <div className="mt-8 border-t-2 border-library-ink pt-5">
            <p className="mb-3 text-xs text-warm-taupe">Signed in as {user.email}</p>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                logout();
                dispatch(logOut());
              }}
            >
              Sign out
            </Button>
          </div>
        ) : null}
      </aside>
    </>
  );
};

export default Sidebar;

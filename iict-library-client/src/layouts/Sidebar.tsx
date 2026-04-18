import { NavLink } from 'react-router-dom';
import { useAppSelector } from '../hooks/store';
import { selectCurrentUser } from '../services/auth.api';
import { Role } from '../types/user.types';

const commonLinks = [
  { to: '/dashboard', label: 'Dashboard' },
];

const adminLinks = [
  { to: '/dashboard/outside-book-log', label: 'Outside Book Log' },
  { to: '/dashboard/spine-label-generator', label: 'Spine Label Generator' },
  // Add other admin links here
];

const studentLinks = [
  { to: '/dashboard/my-outside-books', label: 'My Outside Books' },
  { to: '/dashboard/add-outside-book', label: 'Add Outside Book' },
  // Add other student links here
];

const teacherLinks = [
    // Add teacher links here
];

const Sidebar = () => {
  const user = useAppSelector(selectCurrentUser);

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
    <aside className="w-64 bg-pale-cream text-dark-brown p-4">
      <div className="text-2xl font-bold mb-8">IICT Library</div>
      <nav>
        <ul>
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `block py-2 px-4 rounded transition-colors duration-200 ${
                    isActive
                      ? 'bg-sandy-beige text-dark-brown font-semibold'
                      : 'hover:bg-sandy-beige'
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;

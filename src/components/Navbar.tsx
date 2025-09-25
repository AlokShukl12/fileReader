import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import { useAuth, type UserRole } from '../hooks/useAuth';

type NavLinkItem = {
  to: string;
  label: string;
  requiresAuth?: boolean;
  role?: UserRole;
};

const links: NavLinkItem[] = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/contact', label: 'Contact' },
  { to: '/dashboard', label: 'Dashboard', requiresAuth: true },
  { to: '/admin', label: 'Admin', role: 'admin' },
];

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, isAuthenticating } = useAuth();

  const filteredLinks = links.filter((link) => {
    if (link.role && user?.role !== link.role) {
      return false;
    }
    if (link.requiresAuth && !isAuthenticated) {
      return false;
    }
    return true;
  });

  const handleAuthToggle = () => {
    if (isAuthenticated) {
      logout();
    } else {
      navigate('/login');
    }
  };

  return (
    <motion.header
      className="navbar"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { duration: 0.35, ease: 'easeOut' } }}
    >
      <div className="container navbar__inner">
        <motion.div
          className="navbar__brand"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut', delay: 0.08 } }}
        >
          <div className="navbar__badge" aria-hidden />
          <div>
            <span className="navbar__tagline">Aurora</span>
            <span className="navbar__title brand-gradient">Nexus</span>
          </div>
        </motion.div>

        <nav className="navbar__links" aria-label="Primary">
          {filteredLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'} className="navbar__link">
              {({ isActive }) => (
                <motion.span
                  className="navbar__linkInner"
                  initial={false}
                  animate={{ color: isActive ? '#ffffff' : 'rgba(199, 210, 254, 0.75)' }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  {label}
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        key={to}
                        layoutId="nav-underline"
                        className="navbar__underline"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } }}
                        exit={{ opacity: 0, y: -6, transition: { duration: 0.2, ease: 'easeIn' } }}
                      />
                    )}
                  </AnimatePresence>
                </motion.span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="navbar__actions">
          {!isAuthenticated && (
            <Button as={Link} to="/signup" variant="ghost" style={{ padding: '0.55rem 1.1rem' }}>
              Create account
            </Button>
          )}
          <AnimatePresence mode="wait" initial={false}>
            {isAuthenticated && (
              <motion.span
                key={user?.username || 'guest'}
                className="navbar__user"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } }}
                exit={{ opacity: 0, y: -6, transition: { duration: 0.2 } }}
              >
                <span className="navbar__userLabel">Signed in</span>
                <span className="navbar__userValue">{user?.username}</span>
              </motion.span>
            )}
          </AnimatePresence>
          <Button onClick={handleAuthToggle} disabled={isAuthenticating}>
            {isAuthenticating ? 'Working...' : isAuthenticated ? 'Sign out' : 'Sign in'}
          </Button>
        </div>
      </div>
    </motion.header>
  );
};

export type { NavLinkItem };
export default Navbar;

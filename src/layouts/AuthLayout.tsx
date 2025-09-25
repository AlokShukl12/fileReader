import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

const AuthLayout = () => {
  return (
    <motion.section
      className="auth-layout"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }}
      exit={{ opacity: 0, y: -10, transition: { duration: 0.25, ease: 'easeIn' } }}
    >
      <div className="auth-layout__panel">
        <Outlet />
      </div>
    </motion.section>
  );
};

export default AuthLayout;

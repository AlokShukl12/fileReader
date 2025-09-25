import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }}
          viewport={{ once: true, amount: 0.4 }}
          className="footer-panel"
        >
          <div className="footer-panel__primary">
            <h4>Aurora Nexus</h4>
            <p>Immersive digital experiences with deliberate motion and calm energy.</p>
          </div>
          <p className="footer-panel__meta">
            {`Copyright ${new Date().getFullYear()} Aurora Nexus - Built with React, Vite, and Framer Motion.`}
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;

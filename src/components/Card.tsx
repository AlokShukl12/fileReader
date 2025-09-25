import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  icon: ReactNode;
  title: string;
  description: string;
  cta?: ReactNode;
}

const Card = ({ icon, title, description, cta }: CardProps) => {
  return (
    <motion.div
      className="feature-card"
      variants={{
        rest: { y: 0, boxShadow: 'var(--shadow-card)' },
        hover: { y: -6, boxShadow: '0 24px 42px rgba(56, 189, 248, 0.18)' },
      }}
      initial="rest"
      whileHover="hover"
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 220, damping: 20, mass: 1 }}
    >
      <motion.span
        aria-hidden
        className="feature-card__glow"
        variants={{ rest: { opacity: 0 }, hover: { opacity: 0.35 } }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      />
      <div className="feature-card__icon" aria-hidden>
        {icon}
      </div>
      <h3 className="feature-card__title">{title}</h3>
      <p className="feature-card__body">{description}</p>
      {cta ? (
        <motion.span
          className="feature-card__cta"
          whileHover={{ x: 4 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {cta}
          <span aria-hidden>-&gt;</span>
        </motion.span>
      ) : null}
    </motion.div>
  );
};

export type { CardProps };
export default Card;

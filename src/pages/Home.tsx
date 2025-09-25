import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Card, { type CardProps } from '../components/Card';

const featureCards: CardProps[] = [
  {
    title: 'Fluid Journeys',
    description: 'Guide visitors through crafted story arcs with purposeful motion design and ambient lighting cues.',
    icon: 'FJ',
    cta: 'Explore narrative kits',
  },
  {
    title: 'Realtime Insights',
    description: 'Overlay live signal data and behavioural insights directly inside your dashboards with zero setup.',
    icon: 'RI',
    cta: 'View insight modules',
  },
  {
    title: 'Adaptive Themes',
    description: 'Blend brand expression and accessibility with variable theming tuned to user context.',
    icon: 'AT',
    cta: 'Preview theme tokens',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
} as const;

const Home = () => {
  return (
    <>
      <section className="section-stack">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.32, ease: 'easeOut' } }}
        >
          <span className="stat-badge">Experience-first digital studio</span>
          <h2 className="hero-heading brand-gradient">Design calm, cinematic product stories.</h2>
          <p className="hero-subtitle">
            Aurora Nexus fuses modern interaction design with mindful motion. Bring clarity to complex journeys, orchestrate
            content with ease, and cultivate products that feel alive without overwhelming your users.
          </p>
        </motion.div>
        <div className="section-stack">
          <div className="cta-group">
            <Button as={Link} to="/services">
              <span>Discover our capabilities</span>
            </Button>
            <Button as={Link} to="/contact" variant="ghost">
              <span>Book a walkthrough</span>
            </Button>
          </div>
        </div>
      </section>

      <section className="section-stack">
        <motion.div
          className="grid-responsive columns-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
        >
          {featureCards.map((item) => (
            <motion.div key={item.title} variants={cardVariants}>
              <Card {...item} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="section-stack">
        <motion.div
          className="section-stack--split"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0, transition: { duration: 0.32, ease: 'easeOut' } }}
          viewport={{ once: true, amount: 0.35 }}
        >
          <div className="metric-card">
            <h4>Motion Blueprints</h4>
            <strong>24+</strong>
            <p className="hero-subtitle" style={{ margin: 0 }}>
              Ready-to-adapt Framer Motion patterns for product teams who value nuance.
            </p>
          </div>
          <div className="metric-card">
            <h4>Engagement Lift</h4>
            <strong>+38%</strong>
            <p className="hero-subtitle" style={{ margin: 0 }}>
              Average increase in task completion after adopting Aurora interaction systems.
            </p>
          </div>
          <div className="metric-card">
            <h4>Delivery Velocity</h4>
            <strong>2.4x</strong>
            <p className="hero-subtitle" style={{ margin: 0 }}>
              Faster design-to-ship cycles with our animation ready component library.
            </p>
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default Home;

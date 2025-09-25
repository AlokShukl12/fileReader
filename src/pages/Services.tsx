import { motion } from 'framer-motion';

interface Service {
  title: string;
  description: string;
}

const services: Service[] = [
  {
    title: 'Experience Systems',
    description: 'Blueprint your end-to-end product journeys, define narrative arcs, map signals, and measure pathways.',
  },
  {
    title: 'Motion Architecture',
    description: 'Translate brand principles into motion primitives, gestures, and component choreography ready for dev.',
  },
  {
    title: 'Interaction Engineering',
    description: 'Prototype, test, and productionise responsive interfaces across web and native canvases.',
  },
  {
    title: 'Design Ops Enablement',
    description: 'Embed scalable tooling, documentation, and training to empower internal teams long-term.',
  },
];

const servicesVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
  hover: { y: -6, boxShadow: '0 22px 38px rgba(56, 189, 248, 0.22)' },
} as const;

const Services = () => {
  return (
    <>
      <motion.section
        className="section-stack"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }}
      >
        <span className="stat-badge">Services</span>
        <h2 className="section-title brand-gradient">From idea to living product ecosystems.</h2>
        <p className="hero-subtitle">
          We partner with startups and established product teams to orchestrate experiences that evolve with your
          customers. Our crews embed alongside yours, bringing the craft, playbooks, and tooling required to ship with
          confidence.
        </p>
      </motion.section>

      <section className="grid-responsive columns-3">
        {services.map((service) => (
          <motion.div
            key={service.title}
            className="feature-card"
            variants={servicesVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            whileHover="hover"
          >
            <motion.span
              aria-hidden
              className="feature-card__glow"
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 0.25 }, hover: { opacity: 0.4 } }}
            />
            <div className="feature-card__title">{service.title}</div>
            <p className="feature-card__body">{service.description}</p>
          </motion.div>
        ))}
      </section>

      <motion.section
        className="section-stack"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }}
        viewport={{ once: true, amount: 0.35 }}
      >
        <h3 className="section-title" style={{ fontSize: '1.8rem' }}>What partnering feels like</h3>
        <div className="section-stack--split">
          <div className="metric-card">
            <h4>Embedded collaboration</h4>
            <p className="hero-subtitle" style={{ margin: 0 }}>
              We run workshops, build prototypes, gather feedback, and ship production-ready experiences in tight cadence
              alongside your team.
            </p>
          </div>
          <div className="metric-card">
            <h4>Design + dev continuity</h4>
            <p className="hero-subtitle" style={{ margin: 0 }}>
              Every motion spec is paired with reference implementations, so there is no gulf between the storyboard and the
              shipped build.
            </p>
          </div>
        </div>
      </motion.section>
    </>
  );
};

export default Services;

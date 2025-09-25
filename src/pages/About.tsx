import { motion } from 'framer-motion';

const About = () => {
  return (
    <>
      <motion.section
        className="section-stack"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }}
      >
        <span className="stat-badge">About Aurora Nexus</span>
        <h2 className="section-title brand-gradient">We choreograph experiences that let products breathe.</h2>
        <p className="hero-subtitle">
          The Aurora team blends product strategists, interaction designers, and motion engineers who believe the most
          powerful interfaces are the ones that feel effortless. We craft adaptive systems that let teams scale their
          product stories with clarity, pace, and personality.
        </p>
      </motion.section>

      <section className="section-stack--split">
        <motion.div
          className="glass-panel"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut', delay: 0.08 } }}
          viewport={{ once: true, amount: 0.35 }}
          style={{ padding: '2rem', display: 'grid', gap: '1rem' }}
        >
          <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#f8fafc' }}>Multi-disciplinary core</h3>
          <p style={{ margin: 0, color: 'rgba(203, 213, 225, 0.78)', lineHeight: 1.6 }}>
            From systems design to full-stack implementation, every Aurora project is driven by cross-functional crews that
            collaborate from concept to ship-ready handoff.
          </p>
          <ul style={{ margin: 0, paddingInlineStart: '1.1rem', color: 'rgba(226, 232, 240, 0.85)', lineHeight: 1.7 }}>
            <li>Experience architects</li>
            <li>Motion and prototyping engineers</li>
            <li>Product strategists & researchers</li>
          </ul>
        </motion.div>
        <motion.div
          className="glass-panel"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut', delay: 0.12 } }}
          viewport={{ once: true, amount: 0.35 }}
          style={{ padding: '2rem', display: 'grid', gap: '0.8rem' }}
        >
          <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#f8fafc' }}>Principles we work by</h3>
          <p style={{ margin: 0, color: 'rgba(203, 213, 225, 0.78)', lineHeight: 1.6 }}>
            Every engagement is anchored in measurable outcomes. We prioritise clarity, remove friction, and express brand
            values through motion craft and sound systems thinking.
          </p>
          <div className="metric-card" style={{ margin: 0 }}>
            <h4>Average team velocity</h4>
            <strong>4.6 sprints</strong>
            <p className="hero-subtitle" style={{ margin: 0 }}>
              Time to launch from concept with our motion-enabled component framework.
            </p>
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default About;

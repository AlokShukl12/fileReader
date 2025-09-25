import { useState, type ChangeEvent, type FormEvent } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import Button from '../components/Button';
import { isNonEmpty, isValidEmail } from '../utils/validators';

const shakeVariants = {
  rest: { x: 0 },
  error: {
    x: [0, -12, 12, -10, 10, -6, 6, 0],
    transition: { duration: 0.4, ease: 'easeOut' },
  },
} as const;
interface ContactFormState {
  name: string;
  email: string;
  message: string;
}

type StatusType = 'error' | 'success' | null;

interface ContactStatus {
  type: StatusType;
  message: string;
}

const Contact = () => {
  const [form, setForm] = useState<ContactFormState>({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<ContactStatus>({ type: null, message: '' });
  const emailControls = useAnimationControls();

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isNonEmpty(form.name) || !isNonEmpty(form.message)) {
      setStatus({ type: 'error', message: 'Please share your name and a short project note.' });
      return;
    }

    if (!isValidEmail(form.email)) {
      setStatus({ type: 'error', message: 'Let us know how to reach you with a valid email.' });
      await emailControls.start('error');
      emailControls.set('rest');
      return;
    }

    setStatus({ type: 'success', message: 'Thanks for reaching out! We will respond within two business days.' });
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <>
      <motion.section
        className="section-stack"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }}
      >
        <span className="stat-badge">Contact</span>
        <h2 className="section-title brand-gradient">Share your next chapter.</h2>
        <p className="hero-subtitle">
          Tell us about the problems you are solving and the momentum you are chasing. We tailor every engagement to your
          stage, team composition, and product maturity.
        </p>
      </motion.section>

      <section className="section-stack--split" style={{ alignItems: 'stretch' }}>
        <motion.div
          className="glass-panel"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut', delay: 0.05 } }}
          viewport={{ once: true, amount: 0.35 }}
          style={{ padding: '2.2rem', display: 'grid', gap: '1.4rem' }}
        >
          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <label className="input-label" htmlFor="name">
              name
              <input id="name" name="name" value={form.name} onChange={handleChange} autoComplete="name" />
            </label>

            <motion.label
              className="input-label"
              htmlFor="email"
              variants={shakeVariants}
              animate={emailControls}
            >
              email
              <input id="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" />
            </motion.label>

            <label className="input-label" htmlFor="message">
              project overview
              <textarea id="message" name="message" value={form.message} onChange={handleChange} rows={4} />
            </label>

            <Button type="submit">Send message</Button>
          </form>

          <AnimatePresence mode="wait">
            {status.type && (
              <motion.div
                key={status.type + status.message}
                className={`contact-feedback${status.type === 'error' ? ' contact-feedback--error' : ''}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.24, ease: 'easeOut' } }}
                exit={{ opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeIn' } }}
              >
                {status.message}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="glass-panel"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut', delay: 0.1 } }}
          viewport={{ once: true, amount: 0.35 }}
          style={{ padding: '2.2rem', display: 'grid', gap: '1.2rem' }}
        >
          <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#f8fafc' }}>What to expect</h3>
          <ul style={{ margin: 0, paddingInlineStart: '1.2rem', color: 'rgba(226, 232, 240, 0.82)', lineHeight: 1.75 }}>
            <li>Discovery call to understand your roadmap and timeline.</li>
            <li>Curated team snapshot with recommended track and investment.</li>
            <li>Access to motion blueprint demos relevant to your use case.</li>
          </ul>
          <div className="metric-card" style={{ margin: 0 }}>
            <h4>Typical start window</h4>
            <strong>2-3 weeks</strong>
            <p className="hero-subtitle" style={{ margin: 0 }}>
              From alignment to kickoff, depending on scope and team availability.
            </p>
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default Contact;


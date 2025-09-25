import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';

interface SignUpFormState {
  username: string;
  password: string;
  confirmPassword: string;
}

type StatusType = 'success' | 'error' | null;

interface SignUpStatus {
  message: string | null;
  type: StatusType;
}

const SignUp = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<SignUpFormState>({ username: '', password: '', confirmPassword: '' });
  const [status, setStatus] = useState<SignUpStatus>({ message: null, type: null });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus({ message: null, type: null });

    try {
      await register(form);
      setStatus({ type: 'success', message: 'User registered successfully. Redirecting to login...' });
      setTimeout(() => navigate('/login'), 1200);
    } catch (error: unknown) {
      const fallbackMessage =
        error instanceof Error ? error.message : 'Unable to create the account right now.';
      setStatus({ type: 'error', message: fallbackMessage });
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }}
      className="section-stack"
      style={{ maxWidth: '520px', margin: '0 auto' }}
    >
      <div className="glass-panel" style={{ padding: '2.4rem', display: 'grid', gap: '1.4rem' }}>
        <div>
          <span className="stat-badge">Create an Account</span>
          <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>
            Launch your Aurora workspace
          </h2>
          <p className="hero-subtitle" style={{ margin: 0 }}>
            Usernames can include letters, numbers, and underscores. Passwords need at least six characters.
          </p>
        </div>

        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          <label className="input-label" htmlFor="username">
            username
            <input
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </label>
          <label className="input-label" htmlFor="password">
            password
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </label>
          <label className="input-label" htmlFor="confirmPassword">
            confirm password
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </label>
          <Button type="submit">Sign Up</Button>
        </form>

        {status.message && (
          <motion.div
            key={status.message + status.type}
            className={`contact-feedback${status.type === 'error' ? ' contact-feedback--error' : ''}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.24, ease: 'easeOut' } }}
          >
            {status.message}
          </motion.div>
        )}

        <p className="hero-subtitle" style={{ margin: 0 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'rgba(165, 180, 252, 0.95)', fontWeight: 600 }}>
            Log in
          </Link>
          .
        </p>
      </div>
    </motion.section>
  );
};

export default SignUp;

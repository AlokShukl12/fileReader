import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';

interface LoginFormState {
  username: string;
  password: string;
}

interface LocationState {
  from?: {
    pathname?: string;
  };
}

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation<LocationState>();
  const { login, isAuthenticating } = useAuth();
  const [form, setForm] = useState<LoginFormState>({ username: '', password: '' });
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const fromPath = location.state?.from?.pathname;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setIsSuccess(false);

    try {
      const { role } = await login(form);
      setIsSuccess(true);
      setMessage('Login successful! Redirecting...');
      const fallback = role === 'admin' ? '/admin' : '/dashboard';
      setTimeout(() => navigate(fromPath || fallback, { replace: true }), 800);
    } catch (error: unknown) {
      const fallbackMessage =
        error instanceof Error ? error.message : 'Unable to sign in. Try again in a moment.';
      setMessage(fallbackMessage);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }}
      className="section-stack"
      style={{ maxWidth: '520px', margin: '0 auto' }}
    >
      <div className="glass-panel" style={{ padding: '2.2rem', display: 'grid', gap: '1.4rem' }}>
        <div>
          <span className="stat-badge">Log In</span>
          <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>
            Access your files
          </h2>
          <p className="hero-subtitle" style={{ margin: 0 }}>
            Sign in with your username and password. Use
            <span style={{ color: 'rgba(165, 180, 252, 0.95)', fontWeight: 600 }}> admin / admin123 </span>
            for system controls.
          </p>
        </div>

        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          <label className="input-label" htmlFor="username">
            username
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </label>
          <label className="input-label" htmlFor="password">
            password
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>
          <Button type="submit" disabled={isAuthenticating}>
            {isAuthenticating ? 'Signing in...' : 'Log In'}
          </Button>
        </form>

        {message && (
          <motion.div
            key={message}
            className={`contact-feedback${isSuccess ? '' : ' contact-feedback--error'}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.24, ease: 'easeOut' } }}
          >
            {message}
          </motion.div>
        )}

        <p className="hero-subtitle" style={{ margin: 0 }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'rgba(165, 180, 252, 0.95)', fontWeight: 600 }}>
            Sign up
          </Link>
          .
        </p>
      </div>
    </motion.section>
  );
};

export default Login;

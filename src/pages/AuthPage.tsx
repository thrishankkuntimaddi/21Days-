import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Flame, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';
import './AuthPage.css';

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { toast.error('Fill in all fields'); return; }
    setLoading(true);
    try {
      if (tab === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Welcome back 🔥');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Account created — let\'s build discipline 💪');
      }
    } catch (err: any) {
      const msg = err?.code === 'auth/invalid-credential'
        ? 'Invalid email or password'
        : err?.code === 'auth/email-already-in-use'
        ? 'Email already in use'
        : err?.code === 'auth/weak-password'
        ? 'Password must be at least 6 characters'
        : 'Something went wrong';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-root">
      {/* Background orbs */}
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />

      <div className="auth-card slide-up">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Flame size={24} color="#7c5cfc" />
          </div>
          <div>
            <h1 className="auth-brand">21Days<span>+</span></h1>
            <p className="auth-tagline">Commit. Lock. Conquer.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => setTab('login')}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => setTab('signup')}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email */}
          <div className="auth-field">
            <label className="label">Email</label>
            <div className="auth-input-wrap">
              <Mail size={15} className="auth-input-icon" />
              <input
                id="auth-email"
                className="input auth-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <label className="label">Password</label>
            <div className="auth-input-wrap">
              <Lock size={15} className="auth-input-icon" />
              <input
                id="auth-password"
                className="input auth-input auth-input-pw"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                required
              />
              <button
                type="button"
                className="auth-pw-toggle"
                onClick={() => setShowPw(v => !v)}
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading
              ? <Spinner size={18} />
              : tab === 'login' ? '🔓 Sign In' : '🔥 Create Account'
            }
          </button>
        </form>

        <p className="auth-switch">
          {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            className="auth-switch-link"
            onClick={() => setTab(tab === 'login' ? 'signup' : 'login')}
          >
            {tab === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        <p className="auth-disclaimer">
          <Lock size={11} style={{ display: 'inline', marginRight: 4 }} />
          Your data is private and securely stored.
        </p>
      </div>
    </div>
  );
}

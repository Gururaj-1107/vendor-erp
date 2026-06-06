import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap, ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { AuroraBackground } from '../components/ui/AuroraBackground';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  const handleGoogleLogin = async () => {
    const { googleLogin } = useAuthStore.getState();
    const result = await googleLogin();
    if (result.success) {
      toast.success(`Welcome, ${result.user.first_name || 'User'}!`);
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  const handleDemoFill = () => {
    setForm({ email: 'demo@vendorbridge.com', password: 'demo123' });
    toast.success('Demo credentials filled!');
  };

  return (
    <AuroraBackground>
      <div style={{
        minHeight: '100vh', display: 'flex', width: '100%', maxWidth: 1200, margin: '0 auto',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background orbs */}
        <div style={{
          position: 'absolute', top: -100, left: -100,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -100, right: -100,
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

      {/* Left: Form */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          flex: '0 0 460px', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '60px 52px',
          position: 'relative', zIndex: 1,
        }}
      >
        {/* Logo and Home Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={22} color="white" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>VendorBridge</span>
          </div>
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'rgba(255,255,255,0.02)',
            transition: 'all 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
          }}>
            Back to Home
          </Link>
        </div>

        <h1 style={{ fontSize: 30, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
          Hi there! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 36, fontSize: 14 }}>
          Sign in to your procurement dashboard
        </p>

        <form onSubmit={handleSubmit}>
          <button
            type="button"
            onClick={handleDemoFill}
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center', marginBottom: 20, fontSize: 13, gap: 6 }}
          >
            ⚡ Auto-fill Demo Credentials
          </button>

          <div style={{ marginBottom: 20 }}>
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: 42 }}
                placeholder="you@company.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPass ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: 42, paddingRight: 44 }}
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 28 }}>
            <a href="#" style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none' }}>
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isLoading}
            style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}
          >
            {isLoading ? <div className="spinner" style={{ width: 18, height: 18 }} /> : <>Log In <ArrowRight size={16} /></>}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center', marginBottom: 16, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', gap: 8, height: 44 }}
          >
            <img src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png" width="18" height="18" alt="Google Icon" />
            Sign in with Google
          </button>

          {/* Demo quick login */}
          <div style={{
            background: 'rgba(59,130,246,0.08)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 12,
            color: 'var(--text-secondary)',
          }}>
            <strong style={{ color: 'var(--text-primary)' }}>Demo credentials:</strong><br />
            Email: demo@vendorbridge.com | Password: demo123
          </div>

          <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Sign Up
            </Link>
          </div>
        </form>
      </motion.div>

      {/* Right: Visual panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          flex: 1, position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(6,182,212,0.06) 100%)',
          borderLeft: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 32, padding: 48,
        }}
      >
        {/* Central icon */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          style={{
            width: 160, height: 160, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.2))',
            border: '1px solid rgba(59,130,246,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 72,
          }}
        >
          🏗️
        </motion.div>

        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
            Smart Procurement,{' '}
            <span className="gradient-text">Simplified</span>
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Manage vendors, compare quotations with AI insights, and streamline your entire procurement workflow in one powerful platform.
          </p>
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {['AI-Powered Comparison', 'Smart Approvals', 'Real-time Analytics', 'Vendor Management'].map((f) => (
            <div key={f} style={{
              padding: '8px 16px', borderRadius: 20, fontSize: 12, fontWeight: 500,
              background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
              color: 'var(--primary-light)',
            }}>
              {f}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 32 }}>
          {[
            { value: '500+', label: 'Vendors' },
            { value: '98%', label: 'Uptime' },
            { value: '2.5x', label: 'Faster POs' },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
      </div>
    </AuroraBackground>
  );
}

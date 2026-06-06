import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, User, Mail, Phone, Globe, Briefcase, FileText } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { AuroraBackground } from '../components/ui/AuroraBackground';

const roles = ['Procurement Officer', 'Manager', 'Director', 'Admin', 'Vendor'];
const countries = ['India', 'United States', 'United Kingdom', 'UAE', 'Singapore', 'Australia', 'Other'];

const Field = ({ label, icon: Icon, children }) => (
  <div>
    <label className="form-label">{label}</label>
    <div style={{ position: 'relative' }}>
      {Icon && <Icon size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />}
      {children}
    </div>
  </div>
);

export default function Register() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    role: '', country: 'India', additional_info: '', password: '', confirm_password: '',
  });
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name || !form.email || !form.password || !form.role) {
      return toast.error('Please fill all required fields');
    }
    if (form.password !== form.confirm_password) {
      return toast.error('Passwords do not match');
    }
    const result = await register(form);
    if (result.success) {
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };


  const handleDemoFill = () => {
    setForm({
      first_name: 'Rahul',
      last_name: 'Sharma',
      email: 'rahul.sharma@company.com',
      phone: '+91 99887 76655',
      role: 'Procurement Officer',
      country: 'India',
      password: 'password123',
      confirm_password: 'password123',
      additional_info: 'Mock demo registration data.'
    });
    toast.success('Demo registration data filled!');
  };

  return (
    <AuroraBackground>
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 20px', position: 'relative', overflow: 'hidden', width: '100%',
      }}>
      <div style={{
        position: 'absolute', top: -150, right: -150, width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%', maxWidth: 620,
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 24, padding: '48px 52px',
          position: 'relative', zIndex: 1,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={20} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Create Account</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Join VendorBridge today</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <button
            type="button"
            onClick={handleDemoFill}
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center', marginBottom: 20, fontSize: 13, gap: 6 }}
          >
            ⚡ Auto-fill Demo Data
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <Field label="First Name *" icon={User}>
              <input
                className="form-input" style={{ paddingLeft: 38 }}
                placeholder="John"
                value={form.first_name}
                onChange={e => setForm({ ...form, first_name: e.target.value })}
              />
            </Field>
            <Field label="Last Name *" icon={User}>
              <input
                className="form-input" style={{ paddingLeft: 38 }}
                placeholder="Doe"
                value={form.last_name}
                onChange={e => setForm({ ...form, last_name: e.target.value })}
              />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <Field label="Email *" icon={Mail}>
              <input
                type="email" className="form-input" style={{ paddingLeft: 38 }}
                placeholder="john@company.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </Field>
            <Field label="Phone No." icon={Phone}>
              <input
                className="form-input" style={{ paddingLeft: 38 }}
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label className="form-label">Role *</label>
              <select
                className="form-input"
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                style={{ appearance: 'none' }}
              >
                <option value="">Select role...</option>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <Field label="Country" icon={Globe}>
              <select
                className="form-input" style={{ paddingLeft: 38, appearance: 'none' }}
                value={form.country}
                onChange={e => setForm({ ...form, country: e.target.value })}
              >
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label className="form-label">Password *</label>
              <input
                type="password" className="form-input"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Confirm Password *</label>
              <input
                type="password" className="form-input"
                placeholder="Repeat password"
                value={form.confirm_password}
                onChange={e => setForm({ ...form, confirm_password: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label className="form-label">Additional Information</label>
            <textarea
              className="form-input"
              placeholder="Tell us about your company or procurement needs..."
              value={form.additional_info}
              onChange={e => setForm({ ...form, additional_info: e.target.value })}
              style={{ resize: 'vertical', minHeight: 80 }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isLoading}
            style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}
          >
            {isLoading ? <div className="spinner" style={{ width: 18, height: 18 }} /> : <>Create Account <ArrowRight size={16} /></>}
          </button>

          <button
            type="button"
            onClick={async () => {
              const { googleLogin } = useAuthStore.getState();
              const result = await googleLogin();
              if (result.success) {
                toast.success(`Welcome, ${result.user.first_name || 'User'}!`);
                navigate('/dashboard');
              } else {
                toast.error(result.error);
              }
            }}
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center', marginBottom: 20, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', gap: 8, height: 44 }}
          >
            <img src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png" width="18" height="18" alt="Google Icon" />
            Sign up with Google
          </button>

          <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>
        </form>
      </motion.div>
      </div>
    </AuroraBackground>
  );
}

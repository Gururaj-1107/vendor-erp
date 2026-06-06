import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, CheckCircle, BarChart3, Users, Shield, Clock, Star } from 'lucide-react';
import { AuroraBackground } from '../components/ui/AuroraBackground';
import { RevealText } from '../components/ui/RevealText';

const features = [
  { icon: Users, title: 'Smart Vendor Management', desc: 'Manage supplier profiles, track GST details, and maintain a comprehensive vendor registry with status monitoring.' },
  { icon: BarChart3, title: 'AI-Powered Comparison', desc: 'Compare quotations side-by-side with Gemini AI insights highlighting the best value, fastest delivery, and lowest risk.' },
  { icon: Shield, title: 'Automated Approvals', desc: 'Multi-level approval workflows with L1/L2 review stages, comments, and instant notifications at every step.' },
  { icon: Clock, title: 'Real-time Tracking', desc: 'Track every RFQ, quotation, purchase order and invoice in real-time with a complete audit trail.' },
];

const stats = [
  { value: '500+', label: 'Vendors Managed' },
  { value: '10K+', label: 'RFQs Processed' },
  { value: '2.5x', label: 'Faster Procurement' },
  { value: '99.9%', label: 'Uptime' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <AuroraBackground>
      <div style={{ minHeight: '100vh', width: '100%' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 60px', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10, 10, 26, 0.9)', backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={20} color="white" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700 }}>VendorBridge</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/login')}>Sign In</button>
          <button className="btn btn-primary" onClick={() => navigate('/register')}>Get Started <ArrowRight size={15} /></button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        textAlign: 'center', padding: '100px 60px 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* BG orbs */}
        <div style={{
          position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 20,
            background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
            fontSize: 13, color: 'var(--primary-light)', marginBottom: 28,
          }}>
            <Star size={14} /> AI-Powered Procurement Platform
          </div>

          <div style={{ marginBottom: 12 }}>
            <RevealText text="VENDORBRIDGE" fontSize="text-6xl md:text-8xl" />
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.2, marginBottom: 24, color: 'var(--text-primary)', marginTop: 8 }}>
            The Future of <span className="gradient-text">B2B Procurement</span>
          </h1>

          <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Streamline vendor management, automate RFQ workflows, and make data-driven decisions with AI-powered quotation comparison.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/register')}
              style={{ fontSize: 16, padding: '14px 32px' }}
            >
              Start Free Today <ArrowRight size={18} />
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => navigate('/login')}
              style={{ fontSize: 16, padding: '14px 32px' }}
            >
              Sign In
            </button>
          </div>
        </motion.div>

        {/* Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{
            marginTop: 64, maxWidth: 900, margin: '64px auto 0',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
          }}
        >
          {/* Mock browser bar */}
          <div style={{
            background: 'rgba(59,130,246,0.05)', padding: '12px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {['#FF4757','#FFA502','#1DB954'].map((c,i) => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
            ))}
            <div style={{
              flex: 1, height: 28, borderRadius: 8,
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
              marginLeft: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, color: 'var(--text-muted)',
            }}>
              app.vendorbridge.com/dashboard
            </div>
          </div>

          {/* Mock dashboard */}
          <div style={{ padding: 28, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            {[
              { label: "Active RFQ's", value: '12', color: '#3B82F6' },
              { label: 'Pending Approvals', value: '5', color: '#FFA502' },
              { label: "PO's This Month", value: '28', color: '#1DB954' },
              { label: 'Overdue Invoices', value: '3', color: '#FF4757' },
            ].map((kpi) => (
              <div key={kpi.label} style={{
                background: `rgba(${kpi.color === '#3B82F6' ? '59,130,246' : kpi.color === '#FFA502' ? '255,165,2' : kpi.color === '#1DB954' ? '29,185,84' : '255,71,87'},0.08)`,
                border: `1px solid ${kpi.color}22`,
                borderRadius: 14, padding: '18px 16px',
              }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{kpi.label}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: '0 28px 28px', display: 'flex', gap: 16 }}>
            <div style={{ flex: 1, background: 'rgba(59,130,246,0.06)', borderRadius: 12, padding: 16, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              📊 Spending Trends Chart
            </div>
            <div style={{ flex: 1, background: 'rgba(29,185,84,0.06)', borderRadius: 12, padding: 16, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              🏷️ Recent Purchase Orders
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section style={{ padding: '60px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 80, flexWrap: 'wrap' }}>
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{ textAlign: 'center' }}
            >
              <div style={{ fontSize: 40, fontWeight: 900, color: 'var(--primary)' }}>{s.value}</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 42, fontWeight: 800, marginBottom: 16 }}>
            Everything you need to{' '}
            <span className="gradient-text">procure smarter</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
            A complete procurement suite built for modern businesses.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, maxWidth: 1100, margin: '0 auto' }}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="glass-card"
                style={{ padding: 28 }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.2))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
                }}>
                  <Icon size={24} color="#3B82F6" />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '80px 60px', textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(6,182,212,0.04))',
        borderTop: '1px solid var(--border)',
      }}>
        <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16 }}>
          Ready to transform your procurement?
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 36 }}>
          Join 500+ businesses already using VendorBridge.
        </p>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => navigate('/register')}
          style={{ fontSize: 16, padding: '14px 40px' }}
        >
          Get Started Free <ArrowRight size={18} />
        </button>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '24px 60px', borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 13, color: 'var(--text-muted)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={16} color="#3B82F6" />
          <span>VendorBridge © 2026</span>
        </div>
        <div>Built for the procurement hackathon 🚀</div>
      </footer>
      </div>
    </AuroraBackground>
  );
}

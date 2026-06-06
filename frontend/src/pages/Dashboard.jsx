import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  FileText,
  Clock,
  ShoppingCart,
  AlertTriangle,
  Plus,
  UserPlus,
  Receipt,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Users,
  MessageSquare,
  CheckSquare
} from 'lucide-react';
import { dashboardAPI, aiAPI } from '../services/api';
import { formatCurrency, getStatusBadgeClass } from '../lib/utils';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_KPI = {
  vendorsCount: 0,
  rfqsCount: 0,
  quotationsCount: 0,
  approvalsCount: 0,
};

const MOCK_POS = [
  { id: 'PO-2025-001', vendor: 'InfraSupplies Ltd', amount: 87000, status: 'Approved', date: '2025-05-28' },
  { id: 'PO-2025-002', vendor: 'TechEdge Solutions', amount: 142500, status: 'Pending', date: '2025-06-01' },
  { id: 'PO-2025-003', vendor: 'GlobalPrint Co.', amount: 23400, status: 'Delivered', date: '2025-05-22' },
  { id: 'PO-2025-004', vendor: 'SafetyFirst Equip.', amount: 56800, status: 'Approved', date: '2025-06-03' },
  { id: 'PO-2025-005', vendor: 'OfficeWorld Pvt. Ltd', amount: 11200, status: 'Overdue', date: '2025-05-15' },
];

const MOCK_SPENDING = [
  { month: 'Jan', spend: 320000 },
  { month: 'Feb', spend: 475000 },
  { month: 'Mar', spend: 290000 },
  { month: 'Apr', spend: 610000 },
  { month: 'May', spend: 530000 },
  { month: 'Jun', spend: 387000 },
];

const MOCK_AI_INSIGHT =
  'Vendor "TechEdge Solutions" has 3 pending POs totalling ₹4.2L — consider consolidating into a single order to unlock a projected 8% volume discount. Overdue invoices have increased by 40% compared to last month; initiating early payment terms review is recommended.';

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// ─── Custom Tooltip for Recharts ──────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: '#0B0F19',
          border: '1px solid #1E3A8A',
          padding: '12px 16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          color: '#e2e8f0',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>{label}</p>
        <p style={{ margin: 0, fontWeight: 600, color: '#3B82F6', fontSize: '14px' }}>
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

// ─── KPI Card Component ───────────────────────────────────────────────────────

const KpiCard = ({ icon: Icon, label, value, color }) => (
  <motion.div variants={itemVariants} style={{
    background: '#0F172A',
    border: '1px solid #1E3A8A',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
  }}>
    <div>
      <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </p>
      <p style={{ fontSize: '32px', fontWeight: 400, color: '#F8FAFC', margin: 0, fontFamily: '"PT Serif", serif' }}>
        {value}
      </p>
    </div>
    <div style={{ padding: '12px', background: 'rgba(30,58,138,0.3)', border: '1px solid #1E3A8A' }}>
      <Icon size={24} color={color} />
    </div>
  </motion.div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const [kpi, setKpi] = useState(MOCK_KPI);
  const [recentPOs, setRecentPOs] = useState(MOCK_POS);
  const [spending, setSpending] = useState(MOCK_SPENDING);
  const [aiInsight, setAiInsight] = useState(MOCK_AI_INSIGHT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await Promise.allSettled([
          dashboardAPI.getKPIs(),
          dashboardAPI.getRecentPOs(),
          dashboardAPI.getSpendingTrends(),
          aiAPI.getDashboardInsight()
        ]);
        
        if (results[0].status === 'fulfilled' && results[0].value?.data) setKpi(results[0].value.data);
        if (results[1].status === 'fulfilled' && results[1].value?.data) setRecentPOs(results[1].value.data.slice(0, 5));
        if (results[2].status === 'fulfilled' && results[2].value?.data) setSpending(results[2].value.data);
        if (results[3].status === 'fulfilled' && results[3].value?.data?.insight) setAiInsight(results[3].value.data.insight);
      } catch {
        // Fall back to mock
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const kpiCards = [
    { icon: Users, label: 'No. of Vendors', value: kpi.vendorsCount, color: '#3B82F6' },
    { icon: FileText, label: 'Total RFQs', value: kpi.rfqsCount, color: '#F59E0B' },
    { icon: MessageSquare, label: 'Total Quotations', value: kpi.quotationsCount, color: '#10B981' },
    { icon: CheckSquare, label: 'No. of Approvals', value: kpi.approvalsCount, color: '#EF4444' },
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100%', overflow: 'hidden' }}>
      {/* Animated Background Orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], x: [0, 50, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '-10%', right: '5%', width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(30,58,138,0.4) 0%, transparent 70%)',
          filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none',
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2], x: [0, -40, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        style={{
          position: 'absolute', bottom: '-20%', left: '-10%', width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(14,165,233,0.25) 0%, transparent 70%)',
          filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none',
        }}
      />

      {/* Main Content */}
      <div style={{ padding: '0px 32px 32px 32px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, sans-serif', position: 'relative', zIndex: 1 }}>
        {/* ── Page Header ── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 400, margin: '0 0 8px 0', fontFamily: '"PT Serif", serif', color: '#F8FAFC' }}>
            Executive Dashboard
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate('/rfqs')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#1E40AF', color: 'white', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
            <Plus size={16} /> Create RFQ
          </button>
          <button onClick={() => navigate('/vendors')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#0F172A', color: '#F8FAFC', border: '1px solid #1E3A8A', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
            <UserPlus size={16} /> Add Vendor
          </button>
        </div>
      </motion.div>

      {/* ── KPI Cards ── */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {kpiCards.map((card) => <KpiCard key={card.label} {...card} />)}
      </motion.div>

      {/* ── AI Insight Box ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ background: '#070B19', borderLeft: '4px solid #1E40AF', border: '1px solid #1E3A8A', borderLeftWidth: '4px', padding: '24px', display: 'flex', gap: '20px', marginBottom: '32px', alignItems: 'flex-start' }}>
        <BrainCircuit size={28} color="#3B82F6" style={{ flexShrink: 0, marginTop: '4px' }} />
        <div>
          <h4 style={{ margin: '0 0 8px 0', color: '#F8FAFC', fontSize: '15px', fontWeight: 600 }}>Strategic AI Insight</h4>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>{aiInsight}</p>
        </div>
      </motion.div>

      {/* ── Bottom Grid ── */}
      <div className="dashboard-bottom-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Spending Trends Chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ background: '#0F172A', border: '1px solid #1E3A8A', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 500, color: '#F8FAFC' }}>Spending Overview</h3>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981', fontSize: '13px', fontWeight: 500 }}>
              <TrendingUp size={14} /> +12.4% vs Last Year
            </span>
          </div>
          <div style={{ width: '100%', height: '260px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spending} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#1E3A8A" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000)}k`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(30,58,138,0.2)' }} />
                <Bar dataKey="spend" fill="#3B82F6" barSize={36} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Purchase Orders */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ background: '#0F172A', border: '1px solid #1E3A8A', padding: '0' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #1E3A8A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 500, color: '#F8FAFC' }}>Recent Purchase Orders</h3>
            <button onClick={() => navigate('/purchase-orders')} style={{ background: 'transparent', border: 'none', color: '#3B82F6', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ArrowRight size={14} />
            </button>
          </div>
          
          <div style={{ overflowX: 'auto', padding: '12px 24px 24px 24px' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading data...</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '12px 8px', color: '#64748b', fontSize: '12px', fontWeight: 500, borderBottom: '1px solid #1E3A8A' }}>PO NUMBER</th>
                    <th style={{ textAlign: 'left', padding: '12px 8px', color: '#64748b', fontSize: '12px', fontWeight: 500, borderBottom: '1px solid #1E3A8A' }}>VENDOR</th>
                    <th style={{ textAlign: 'left', padding: '12px 8px', color: '#64748b', fontSize: '12px', fontWeight: 500, borderBottom: '1px solid #1E3A8A' }}>AMOUNT</th>
                    <th style={{ textAlign: 'left', padding: '12px 8px', color: '#64748b', fontSize: '12px', fontWeight: 500, borderBottom: '1px solid #1E3A8A' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPOs.map((po) => (
                    <tr key={po.id} onClick={() => navigate('/purchase-orders')} style={{ cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(30,58,138,0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '16px 8px', color: '#F8FAFC', fontSize: '13px', borderBottom: '1px solid rgba(30,58,138,0.3)' }}>{po.po_number || po.id}</td>
                      <td style={{ padding: '16px 8px', color: '#94a3b8', fontSize: '13px', borderBottom: '1px solid rgba(30,58,138,0.3)' }}>{po.vendor?.name || po.vendor_name || po.vendor || 'Unknown Vendor'}</td>
                      <td style={{ padding: '16px 8px', color: '#F8FAFC', fontSize: '13px', fontWeight: 500, borderBottom: '1px solid rgba(30,58,138,0.3)' }}>{formatCurrency(po.total_amount || po.amount)}</td>
                      <td style={{ padding: '16px 8px', borderBottom: '1px solid rgba(30,58,138,0.3)' }}>
                        <span className={`badge ${getStatusBadgeClass(po.status)}`} style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '4px' }}>
                          {po.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>
      
      </div>
    </div>
  );
}

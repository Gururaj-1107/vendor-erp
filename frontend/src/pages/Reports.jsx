import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Users,
  CheckCircle,
  AlertTriangle,
  Download,
  Sparkles,
  ChevronDown,
  IndianRupee,
  RefreshCw,
} from 'lucide-react';
import { reportsAPI, aiAPI } from '../services/api';
import { formatCurrency } from '../lib/utils';
import toast from 'react-hot-toast';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CATEGORY_SPEND = [
  { category: 'IT', spend: 480000 },
  { category: 'Furniture', spend: 210000 },
  { category: 'Logistics', spend: 315000 },
  { category: 'HR', spend: 145000 },
  { category: 'Operations', spend: 290000 },
];

const MOCK_TOP_VENDORS = [
  { name: 'InfraSupplies Pvt Ltd', spend: 420000, pct: 34 },
  { name: 'TechZone Solutions', spend: 280000, pct: 23 },
  { name: 'QuickLogistics Co.', spend: 195000, pct: 16 },
  { name: 'FurnishPro India', spend: 145000, pct: 12 },
  { name: 'HR Dynamics Ltd', spend: 92000, pct: 7 },
];

const MOCK_MONTHLY_TREND = [
  { month: 'Dec', spend: 780000 },
  { month: 'Jan', spend: 920000 },
  { month: 'Feb', spend: 860000 },
  { month: 'Mar', spend: 1050000 },
  { month: 'Apr', spend: 990000 },
  { month: 'May', spend: 1240000 },
];

const CATEGORY_COLORS = ['#3B82F6', '#A78BFA', '#38BDF8', '#34D399', '#FB923C'];

const MONTHS = [
  'January 2025',
  'February 2025',
  'March 2025',
  'April 2025',
  'May 2025',
  'June 2025',
];

const AI_MOCK_INSIGHT =
  'Procurement spend increased by 12% this month driven by IT hardware purchases. Top vendor InfraSupplies contributed 34% of total spend. Recommend renegotiating logistics contracts to reduce costs by est. 8–12%.';

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: '#12122A',
          border: '1px solid rgba(59,130,246,0.35)',
          borderRadius: 10,
          padding: '10px 16px',
        }}
      >
        <p style={{ color: '#A0A0C0', fontSize: 12, marginBottom: 4 }}>{label}</p>
        <p style={{ color: '#3B82F6', fontWeight: 700, fontSize: 15 }}>
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

const CustomLineTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: '#12122A',
          border: '1px solid rgba(59,130,246,0.35)',
          borderRadius: 10,
          padding: '10px 16px',
        }}
      >
        <p style={{ color: '#A0A0C0', fontSize: 12, marginBottom: 4 }}>{label}</p>
        <p style={{ color: '#3B82F6', fontWeight: 700, fontSize: 15 }}>
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────

const KpiCard = ({ icon: Icon, label, value, sub, color, index }) => (
  <motion.div
    className="glass-card"
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08, duration: 0.4 }}
    style={{ padding: '24px 28px', display: 'flex', alignItems: 'flex-start', gap: 18 }}
  >
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: 14,
        background: `${color}22`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon size={24} color={color} />
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>{label}</p>
      <p style={{ color: '#fff', fontSize: 26, fontWeight: 700, lineHeight: 1.1 }}>{value}</p>
      {sub && (
        <p style={{ color: color, fontSize: 12, marginTop: 4, fontWeight: 500 }}>{sub}</p>
      )}
    </div>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Reports() {
  const [selectedMonth, setSelectedMonth] = useState('May 2025');
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);

  const [categoryData, setCategoryData] = useState(MOCK_CATEGORY_SPEND);
  const [topVendors, setTopVendors] = useState(MOCK_TOP_VENDORS);
  const [monthlyTrend, setMonthlyTrend] = useState(MOCK_MONTHLY_TREND);

  const [aiInsight, setAiInsight] = useState('');
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState(false);

  // Fetch report data (falls back to mock if API fails)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, vendorRes, trendRes] = await Promise.all([
          reportsAPI.getSpendByCategory({ month: selectedMonth }),
          reportsAPI.getTopVendors({ month: selectedMonth }),
          reportsAPI.getMonthlyTrend(),
        ]);
        if (catRes?.data?.length) setCategoryData(catRes.data);
        if (vendorRes?.data?.length) setTopVendors(vendorRes.data);
        if (trendRes?.data?.length) setMonthlyTrend(trendRes.data);
      } catch {
        // silently fall back to mock data
      }
    };
    fetchData();
  }, [selectedMonth]);

  // Fetch AI insight on mount
  useEffect(() => {
    const fetchInsight = async () => {
      setAiLoading(true);
      setAiError(false);
      setAiInsight('');
      try {
        const res = await aiAPI.getReportInsight({ month: selectedMonth });
        const text = res?.data?.insight || AI_MOCK_INSIGHT;
        // Typewriter reveal
        typewriterReveal(text);
      } catch {
        // Use mock insight with typewriter
        typewriterReveal(AI_MOCK_INSIGHT);
      }
    };
    fetchInsight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);

  const typewriterReveal = (text) => {
    setAiLoading(false);
    setAiInsight('');
    let i = 0;
    const interval = setInterval(() => {
      setAiInsight(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 18);
  };

  const handleExport = () => {
    toast.success('Generating report…', {
      duration: 3000,
      icon: '📄',
      style: {
        background: '#12122A',
        color: '#fff',
        border: '1px solid rgba(59,130,246,0.3)',
      },
    });
    // Attempt real export
    reportsAPI.export({ month: selectedMonth }).catch(() => {});
  };

  const handleMonthSelect = (m) => {
    setSelectedMonth(m);
    setMonthDropdownOpen(false);
  };

  return (
    <div className="page-container">
      {/* ── Page Header ── */}
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <motion.h1
            className="gradient-text"
            style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            Reports &amp; Analytics
          </motion.h1>
          <motion.p
            style={{ color: 'var(--text-muted)', fontSize: 14 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            Procurement Insights — {selectedMonth}
          </motion.p>
        </div>

        {/* Right controls */}
        <motion.div
          style={{ display: 'flex', gap: 12, alignItems: 'center' }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {/* Month Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 148 }}
              onClick={() => setMonthDropdownOpen((p) => !p)}
            >
              <span>{selectedMonth}</span>
              <ChevronDown
                size={15}
                style={{
                  transition: 'transform 0.2s',
                  transform: monthDropdownOpen ? 'rotate(180deg)' : 'none',
                }}
              />
            </button>

            <AnimatePresence>
              {monthDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    right: 0,
                    background: '#12122A',
                    border: '1px solid rgba(59,130,246,0.3)',
                    borderRadius: 10,
                    overflow: 'hidden',
                    zIndex: 100,
                    minWidth: 160,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}
                >
                  {MONTHS.map((m) => (
                    <button
                      key={m}
                      onClick={() => handleMonthSelect(m)}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 16px',
                        background: m === selectedMonth ? 'rgba(59,130,246,0.15)' : 'transparent',
                        color: m === selectedMonth ? '#3B82F6' : '#C0C0D8',
                        fontSize: 14,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        if (m !== selectedMonth)
                          e.currentTarget.style.background = 'rgba(59,130,246,0.08)';
                      }}
                      onMouseLeave={(e) => {
                        if (m !== selectedMonth)
                          e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Export Button */}
          <button
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={handleExport}
          >
            <Download size={15} />
            Export
          </button>
        </motion.div>
      </div>

      {/* ── KPI Cards ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 20,
          marginBottom: 28,
        }}
      >
        <KpiCard
          index={0}
          icon={IndianRupee}
          label="Total Spend"
          value="₹12.4L"
          sub="↑ 12% vs last month"
          color="#3B82F6"
        />
        <KpiCard
          index={1}
          icon={Users}
          label="Active Vendors"
          value="28"
          sub="2 new this month"
          color="#38BDF8"
        />
        <KpiCard
          index={2}
          icon={CheckCircle}
          label="PO Fulfillment"
          value="94%"
          sub="Above target (90%)"
          color="#34D399"
        />
        <KpiCard
          index={3}
          icon={AlertTriangle}
          label="Overdue Invoices"
          value="3"
          sub="Action required"
          color="#FB923C"
        />
      </div>

      {/* ── Two-Column Charts ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          marginBottom: 28,
        }}
      >
        {/* Spend by Category */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          style={{ padding: '24px 28px' }}
        >
          <h3
            style={{
              color: '#fff',
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 20,
            }}
          >
            Spend by Category
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={categoryData}
              margin={{ top: 4, right: 10, left: 0, bottom: 4 }}
              barSize={32}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(59,130,246,0.12)"
                vertical={false}
              />
              <XAxis
                dataKey="category"
                tick={{ fill: '#8080A0', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
                tick={{ fill: '#8080A0', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(59,130,246,0.07)' }} />
              <Bar dataKey="spend" radius={[6, 6, 0, 0]}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Vendors by Spend */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.4 }}
          style={{ padding: '24px 28px' }}
        >
          <h3
            style={{
              color: '#fff',
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 20,
            }}
          >
            Top Vendors by Spend
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {topVendors.map((v, i) => (
              <motion.div
                key={v.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.07, duration: 0.35 }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        background: `${CATEGORY_COLORS[i]}22`,
                        color: CATEGORY_COLORS[i],
                        fontSize: 11,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ color: '#C8C8E8', fontSize: 13, fontWeight: 500 }}>
                      {v.name}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
                      {formatCurrency(v.spend)}
                    </span>
                    <span
                      style={{
                        color: CATEGORY_COLORS[i],
                        fontSize: 11,
                        marginLeft: 8,
                        fontWeight: 500,
                      }}
                    >
                      {v.pct}%
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div
                  style={{
                    height: 5,
                    borderRadius: 999,
                    background: 'rgba(59,130,246,0.12)',
                    overflow: 'hidden',
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${v.pct}%` }}
                    transition={{ delay: 0.55 + i * 0.07, duration: 0.6, ease: 'easeOut' }}
                    style={{
                      height: '100%',
                      borderRadius: 999,
                      background: `linear-gradient(90deg, ${CATEGORY_COLORS[i]}, ${CATEGORY_COLORS[i]}99)`,
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Monthly Trend (Full Width) ── */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.52, duration: 0.4 }}
        style={{ padding: '24px 28px', marginBottom: 28 }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>
            Monthly Spend Trend
          </h3>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Last 6 months</span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart
            data={monthlyTrend}
            margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
          >
            <defs>
              <linearGradient id="spendGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#A78BFA" />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(59,130,246,0.12)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fill: '#8080A0', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
              tick={{ fill: '#8080A0', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Tooltip content={<CustomLineTooltip />} />
            <Legend
              formatter={(value) => (
                <span style={{ color: '#A0A0C0', fontSize: 12 }}>
                  {value === 'spend' ? 'Monthly Spend' : value}
                </span>
              )}
            />
            <Line
              type="monotone"
              dataKey="spend"
              stroke="url(#spendGrad)"
              strokeWidth={3}
              dot={{ r: 5, fill: '#3B82F6', strokeWidth: 2, stroke: '#12122A' }}
              activeDot={{ r: 7, fill: '#A78BFA', stroke: '#12122A', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* ── AI Insights Box ── */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        style={{
          padding: '24px 28px',
          border: '1px solid rgba(59,130,246,0.3)',
          background:
            'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(18,18,42,0.9) 100%)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(59,130,246,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={18} color="#A78BFA" />
          </div>
          <div>
            <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, margin: 0 }}>
              AI-Powered Insights
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>
              Gemini analysis for {selectedMonth}
            </p>
          </div>

          {/* Refresh button */}
          <button
            className="btn btn-ghost"
            style={{ marginLeft: 'auto', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => {
              setAiLoading(true);
              setAiInsight('');
              setTimeout(() => typewriterReveal(AI_MOCK_INSIGHT), 1200);
            }}
            disabled={aiLoading}
          >
            <RefreshCw
              size={13}
              style={{
                animation: aiLoading ? 'spin 1s linear infinite' : 'none',
              }}
            />
            Refresh
          </button>
        </div>

        {/* Body */}
        <AnimatePresence mode="wait">
          {aiLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 0' }}
            >
              {/* Pulsing skeleton bars */}
              <div style={{ flex: 1 }}>
                {[100, 85, 70].map((w, i) => (
                  <div
                    key={i}
                    style={{
                      height: 12,
                      borderRadius: 6,
                      background: 'rgba(59,130,246,0.15)',
                      width: `${w}%`,
                      marginBottom: i < 2 ? 10 : 0,
                      animation: 'pulse 1.5s ease-in-out infinite',
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
              <div className="spinner" style={{ width: 24, height: 24, flexShrink: 0 }} />
            </motion.div>
          ) : aiError ? (
            <motion.p
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ color: '#FB923C', fontSize: 14 }}
            >
              Unable to load AI insight. Please try again.
            </motion.p>
          ) : (
            <motion.div
              key="insight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p
                style={{
                  color: '#C8C8E8',
                  fontSize: 15,
                  lineHeight: 1.75,
                  margin: 0,
                  minHeight: 60,
                }}
              >
                {aiInsight}
                {/* blinking cursor while typing */}
                {aiInsight.length < AI_MOCK_INSIGHT.length && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: 2,
                      height: '1em',
                      background: '#3B82F6',
                      marginLeft: 2,
                      verticalAlign: 'middle',
                      animation: 'blink 0.8s step-end infinite',
                    }}
                  />
                )}
              </p>

              {/* Tag pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                {['IT Spend ↑ 12%', 'InfraSupplies 34%', 'Logistics Savings 8–12%'].map(
                  (tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: '4px 12px',
                        borderRadius: 999,
                        background: 'rgba(59,130,246,0.15)',
                        color: '#A78BFA',
                        fontSize: 12,
                        fontWeight: 500,
                        border: '1px solid rgba(59,130,246,0.25)',
                      }}
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Inline keyframe styles ── */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.9; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

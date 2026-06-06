import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  CheckCircle,
  Receipt,
  Building2,
  AlertTriangle,
  UserPlus,
  XCircle,
  RefreshCw,
  Send,
  Eye,
  Edit3,
  Trash2,
  Clock,
  Filter,
  Download
} from 'lucide-react';
import Papa from 'papaparse';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────
// Mock data – 15+ entries
// ─────────────────────────────────────────────
const MOCK_ACTIVITIES = [
  {
    id: 1,
    type: 'rfq',
    icon: FileText,
    action: 'RFQ-2025-004 created',
    detail: 'New RFQ for IT Equipment & Peripherals raised by Rahul Sharma',
    user: 'Rahul Sharma',
    role: 'Procurement Officer',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    relativeTime: '2 hours ago',
    tag: 'RFQ-2025-004',
  },
  {
    id: 2,
    type: 'rfq',
    icon: Send,
    action: 'Quotation submitted by TechCore Ltd',
    detail: 'Vendor TechCore Ltd submitted a quotation of ₹4,85,000 for RFQ-2025-004',
    user: 'TechCore Ltd',
    role: 'Vendor',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    relativeTime: '1 hour ago',
    tag: 'RFQ-2025-004',
  },
  {
    id: 3,
    type: 'approvals',
    icon: CheckCircle,
    action: 'RFQ-2025-003 approved',
    detail: 'Director Priya Mehta approved RFQ-2025-003 for Office Furniture',
    user: 'Priya Mehta',
    role: 'Director',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    relativeTime: '3 hours ago',
    tag: 'RFQ-2025-003',
  },
  {
    id: 4,
    type: 'vendors',
    icon: Building2,
    action: 'Vendor status changed to Active',
    detail: 'InfraSupplies Ltd status updated from Pending to Active after document verification',
    user: 'Admin',
    role: 'System Admin',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    relativeTime: '5 hours ago',
    tag: 'InfraSupplies Ltd',
  },
  {
    id: 5,
    type: 'invoices',
    icon: AlertTriangle,
    action: 'Invoice INV-009 marked as overdue',
    detail: 'Invoice INV-009 from GlobalTech Solutions is 7 days past due date',
    user: 'System',
    role: 'Automated',
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000),
    relativeTime: 'Yesterday',
    tag: 'INV-009',
  },
  {
    id: 6,
    type: 'invoices',
    icon: Receipt,
    action: 'Invoice INV-008 paid',
    detail: 'Payment of ₹2,30,000 processed for INV-008 from Acme Supplies',
    user: 'Anita Roy',
    role: 'Finance Manager',
    timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000),
    relativeTime: 'Yesterday',
    tag: 'INV-008',
  },
  {
    id: 7,
    type: 'approvals',
    icon: XCircle,
    action: 'PO-2025-011 rejected',
    detail: 'Purchase Order PO-2025-011 rejected by CFO Ramesh Gupta — budget exceeded',
    user: 'Ramesh Gupta',
    role: 'CFO',
    timestamp: new Date(Date.now() - 32 * 60 * 60 * 1000),
    relativeTime: 'Yesterday',
    tag: 'PO-2025-011',
  },
  {
    id: 8,
    type: 'vendors',
    icon: UserPlus,
    action: 'New vendor registered',
    detail: 'SwiftLogistics Pvt Ltd completed registration and is pending verification',
    user: 'SwiftLogistics Pvt Ltd',
    role: 'Vendor',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    relativeTime: '2 days ago',
    tag: 'SwiftLogistics Pvt Ltd',
  },
  {
    id: 9,
    type: 'rfq',
    icon: Edit3,
    action: 'RFQ-2025-002 deadline extended',
    detail: 'Submission deadline extended by 5 days on request from vendors',
    user: 'Rahul Sharma',
    role: 'Procurement Officer',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    relativeTime: '2 days ago',
    tag: 'RFQ-2025-002',
  },
  {
    id: 10,
    type: 'approvals',
    icon: CheckCircle,
    action: 'PO-2025-010 approved',
    detail: 'Purchase Order PO-2025-010 for Networking Equipment approved by GM Suresh Nair',
    user: 'Suresh Nair',
    role: 'General Manager',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    relativeTime: '3 days ago',
    tag: 'PO-2025-010',
  },
  {
    id: 11,
    type: 'invoices',
    icon: Receipt,
    action: 'Invoice INV-007 raised',
    detail: 'New invoice INV-007 of ₹1,15,500 received from TechCore Ltd',
    user: 'TechCore Ltd',
    role: 'Vendor',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    relativeTime: '3 days ago',
    tag: 'INV-007',
  },
  {
    id: 12,
    type: 'vendors',
    icon: RefreshCw,
    action: 'Vendor documents renewed',
    detail: 'BlueStar Electricals updated GST certificate and tax documentation',
    user: 'BlueStar Electricals',
    role: 'Vendor',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    relativeTime: '4 days ago',
    tag: 'BlueStar Electricals',
  },
  {
    id: 13,
    type: 'rfq',
    icon: Eye,
    action: 'RFQ-2025-001 closed',
    detail: 'RFQ-2025-001 for Cleaning Services closed after vendor selection',
    user: 'System',
    role: 'Automated',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    relativeTime: '5 days ago',
    tag: 'RFQ-2025-001',
  },
  {
    id: 14,
    type: 'approvals',
    icon: CheckCircle,
    action: 'Vendor InfraSupplies Ltd approved',
    detail: 'Vendor InfraSupplies Ltd cleared compliance check and onboarded',
    user: 'Priya Mehta',
    role: 'Director',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    relativeTime: '6 days ago',
    tag: 'InfraSupplies Ltd',
  },
  {
    id: 15,
    type: 'invoices',
    icon: AlertTriangle,
    action: 'Invoice INV-005 disputed',
    detail: 'Finance raised a dispute on INV-005 — quantity mismatch with PO-2025-007',
    user: 'Anita Roy',
    role: 'Finance Manager',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    relativeTime: '7 days ago',
    tag: 'INV-005',
  },
  {
    id: 16,
    type: 'vendors',
    icon: Trash2,
    action: 'Vendor QuickParts Co. blacklisted',
    detail: 'QuickParts Co. blacklisted due to repeated quality failures and non-compliance',
    user: 'Admin',
    role: 'System Admin',
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    relativeTime: '8 days ago',
    tag: 'QuickParts Co.',
  },
];

// ─────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────
const TABS = [
  { key: 'all', label: 'All' },
  { key: 'rfq', label: 'RFQ' },
  { key: 'approvals', label: 'Approvals' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'vendors', label: 'Vendors' },
];

const TYPE_STYLES = {
  rfq: {
    bg: 'rgba(59,130,246,0.15)',
    border: 'rgba(59,130,246,0.4)',
    icon: '#3B82F6',
    dot: '#3B82F6',
    label: 'RFQ',
    labelBg: 'rgba(59,130,246,0.15)',
    labelColor: '#3B82F6',
  },
  approvals: {
    bg: 'rgba(34,197,94,0.12)',
    border: 'rgba(34,197,94,0.35)',
    icon: '#22C55E',
    dot: '#22C55E',
    label: 'Approval',
    labelBg: 'rgba(34,197,94,0.15)',
    labelColor: '#22C55E',
  },
  invoices: {
    bg: 'rgba(249,115,22,0.12)',
    border: 'rgba(249,115,22,0.35)',
    icon: '#F97316',
    dot: '#F97316',
    label: 'Invoice',
    labelBg: 'rgba(249,115,22,0.15)',
    labelColor: '#F97316',
  },
  vendors: {
    bg: 'rgba(59,130,246,0.12)',
    border: 'rgba(59,130,246,0.35)',
    icon: '#3B82F6',
    dot: '#3B82F6',
    label: 'Vendor',
    labelBg: 'rgba(59,130,246,0.15)',
    labelColor: '#3B82F6',
  },
};

const formatFullDate = (date) =>
  date.toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function ActivityLogs() {
  const [activeTab, setActiveTab] = useState('all');
  const [hoveredId, setHoveredId] = useState(null);

  const filtered = useMemo(() => {
    if (activeTab === 'all') return MOCK_ACTIVITIES;
    return MOCK_ACTIVITIES.filter((a) => a.type === activeTab);
  }, [activeTab]);

  // Counts per tab
  const counts = useMemo(() => {
    const c = { all: MOCK_ACTIVITIES.length };
    MOCK_ACTIVITIES.forEach((a) => {
      c[a.type] = (c[a.type] || 0) + 1;
    });
    return c;
  }, []);

  const handleDownloadCSV = () => {
    const csvData = filtered.map(item => ({
      ID: item.id,
      Type: item.type,
      Action: item.action,
      Detail: item.detail,
      User: item.user,
      Role: item.role,
      Tag: item.tag,
      Date: item.timestamp.toISOString(),
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Activity_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV downloaded successfully!');
  };

  return (
    <div className="page-container" style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* ── Page Header ── */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
      >
        <div>
          <h1 className="gradient-text" style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
            Activity &amp; Logs
          </h1>
          <p style={{ color: 'var(--text-muted, #8884a8)', fontSize: 14, margin: 0 }}>
            Procurement Audit Trail
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 8,
              background: 'rgba(59,130,246,0.08)',
              border: '1px solid rgba(59,130,246,0.2)',
              color: '#8884a8',
              fontSize: 13,
            }}
          >
            <Clock size={14} />
            <span>Updated just now</span>
          </div>
          <button
            onClick={handleDownloadCSV}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={14} /> Download CSV
          </button>
        </div>
      </motion.div>

      {/* ── Filter Tabs ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 28,
          flexWrap: 'wrap',
        }}
      >
        <Filter size={14} style={{ color: '#8884a8', marginRight: 4 }} />
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const style = tab.key !== 'all' ? TYPE_STYLES[tab.key] : null;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 16px',
                borderRadius: 20,
                border: isActive
                  ? `1.5px solid ${style ? style.dot : '#3B82F6'}`
                  : '1.5px solid rgba(59,130,246,0.15)',
                background: isActive
                  ? style
                    ? style.bg
                    : 'rgba(59,130,246,0.15)'
                  : 'rgba(255,255,255,0.03)',
                color: isActive
                  ? style
                    ? style.icon
                    : '#3B82F6'
                  : '#8884a8',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.label}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 20,
                  height: 20,
                  borderRadius: 10,
                  background: isActive
                    ? style
                      ? style.dot
                      : '#3B82F6'
                    : 'rgba(59,130,246,0.12)',
                  color: isActive ? '#fff' : '#8884a8',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '0 5px',
                }}
              >
                {counts[tab.key] || 0}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* ── Timeline Feed ── */}
      <div style={{ position: 'relative' }}>
        {/* Vertical spine */}
        <div
          style={{
            position: 'absolute',
            left: 20,
            top: 10,
            bottom: 10,
            width: 2,
            background:
              'linear-gradient(to bottom, rgba(59,130,246,0.4) 0%, rgba(59,130,246,0.08) 100%)',
            borderRadius: 2,
          }}
        />

        <AnimatePresence mode="popLayout">
          {filtered.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                paddingLeft: 56,
                color: '#8884a8',
                fontSize: 14,
                paddingTop: 24,
              }}
            >
              No activity found for this filter.
            </motion.div>
          )}

          {filtered.map((item, idx) => {
            const style = TYPE_STYLES[item.type];
            const Icon = item.icon;
            const isHovered = hoveredId === item.id;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16, transition: { duration: 0.18 } }}
                transition={{ duration: 0.3, delay: idx * 0.045 }}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ position: 'relative', display: 'flex', gap: 16, marginBottom: 0 }}
              >
                {/* Icon circle */}
                <div style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: style.bg,
                      border: `1.5px solid ${style.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      transform: isHovered ? 'scale(1.12)' : 'scale(1)',
                      boxShadow: isHovered ? `0 0 14px ${style.dot}44` : 'none',
                    }}
                  >
                    <Icon size={17} color={style.icon} strokeWidth={2} />
                  </div>
                </div>

                {/* Card */}
                <div
                  style={{
                    flex: 1,
                    marginBottom: idx < filtered.length - 1 ? 0 : 0,
                  }}
                >
                  <div
                    style={{
                      background: isHovered ? 'rgba(59,130,246,0.06)' : 'rgba(18,18,42,0.7)',
                      border: `1px solid ${isHovered ? style.border : 'rgba(59,130,246,0.1)'}`,
                      borderRadius: 12,
                      padding: '14px 18px',
                      transition: 'all 0.2s ease',
                      marginBottom: 2,
                    }}
                  >
                    {/* Top row */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 10,
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        {/* Type badge */}
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            padding: '2px 8px',
                            borderRadius: 20,
                            background: style.labelBg,
                            color: style.labelColor,
                            border: `1px solid ${style.border}`,
                          }}
                        >
                          {style.label}
                        </span>
                        {/* Tag */}
                        <span
                          style={{
                            fontSize: 11,
                            color: '#8884a8',
                            background: 'rgba(255,255,255,0.04)',
                            padding: '2px 8px',
                            borderRadius: 6,
                            border: '1px solid rgba(59,130,246,0.1)',
                          }}
                        >
                          {item.tag}
                        </span>
                      </div>

                      {/* Timestamp */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          gap: 2,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: style.icon,
                          }}
                        >
                          {item.relativeTime}
                        </span>
                        <span style={{ fontSize: 10, color: '#6b6882' }}>
                          {formatFullDate(item.timestamp)}
                        </span>
                      </div>
                    </div>

                    {/* Action title */}
                    <p
                      style={{
                        margin: '10px 0 4px',
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#E2E0FF',
                        lineHeight: 1.4,
                      }}
                    >
                      {item.action}
                    </p>

                    {/* Detail */}
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        color: '#8884a8',
                        lineHeight: 1.5,
                      }}
                    >
                      {item.detail}
                    </p>

                    {/* Footer */}
                    <div
                      style={{
                        marginTop: 10,
                        paddingTop: 10,
                        borderTop: '1px solid rgba(59,130,246,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      {/* Avatar circle */}
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: style.bg,
                          border: `1px solid ${style.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          fontWeight: 700,
                          color: style.icon,
                          flexShrink: 0,
                        }}
                      >
                        {item.user.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: 12, color: '#E2E0FF', fontWeight: 500 }}>
                        {item.user}
                      </span>
                      <span style={{ fontSize: 11, color: '#6b6882' }}>·</span>
                      <span style={{ fontSize: 11, color: '#6b6882' }}>{item.role}</span>
                    </div>
                  </div>

                  {/* Separator line between items */}
                  {idx < filtered.length - 1 && (
                    <div
                      style={{
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: 2,
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: 1,
                          background: 'rgba(59,130,246,0.07)',
                        }}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── Footer note ── */}
      {filtered.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            textAlign: 'center',
            color: '#6b6882',
            fontSize: 12,
            marginTop: 32,
            marginBottom: 8,
          }}
        >
          Showing {filtered.length} of {MOCK_ACTIVITIES.length} total audit events
        </motion.p>
      )}
    </div>
  );
}

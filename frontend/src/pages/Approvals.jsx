import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  ChevronRight,
  Star,
  FileText,
  User,
  Truck,
  AlertCircle,
  X,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { approvalsAPI } from '../services/api';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../lib/utils';
import toast from 'react-hot-toast';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_APPROVALS = [
  {
    id: 'APR-001',
    rfq: 'Office Furniture Q2',
    rfqId: 'RFQ-2024-0089',
    vendorAwarded: 'InfraSupplies Pvt. Ltd.',
    amount: 185400,
    submittedBy: 'Ravi Sharma',
    status: 'pending',
    date: '2024-06-01',
    currentStep: 1,
    vendor: {
      name: 'InfraSupplies Pvt. Ltd.',
      total: 185400,
      delivery: '14 days',
      rating: 4,
    },
    approvalChain: [
      { name: 'Ravi Sharma', role: 'Requester', status: 'approved', avatar: 'RS' },
      { name: 'Meena Iyer', role: 'L1 Approver – Finance', status: 'in_progress', avatar: 'MI' },
      { name: 'Arjun Nair', role: 'L2 Approver – VP Ops', status: 'pending', avatar: 'AN' },
      { name: 'System', role: 'PO Generator', status: 'pending', avatar: 'SY' },
    ],
  },
  {
    id: 'APR-002',
    rfq: 'IT Hardware Refresh',
    rfqId: 'RFQ-2024-0076',
    vendorAwarded: 'TechVision Solutions',
    amount: 534200,
    submittedBy: 'Priya Mehta',
    status: 'approved',
    date: '2024-05-28',
    currentStep: 3,
    vendor: {
      name: 'TechVision Solutions',
      total: 534200,
      delivery: '21 days',
      rating: 5,
    },
    approvalChain: [
      { name: 'Priya Mehta', role: 'Requester', status: 'approved', avatar: 'PM' },
      { name: 'Meena Iyer', role: 'L1 Approver – Finance', status: 'approved', avatar: 'MI' },
      { name: 'Arjun Nair', role: 'L2 Approver – VP Ops', status: 'approved', avatar: 'AN' },
      { name: 'System', role: 'PO Generator', status: 'approved', avatar: 'SY' },
    ],
  },
  {
    id: 'APR-003',
    rfq: 'Cleaning Services Contract',
    rfqId: 'RFQ-2024-0068',
    vendorAwarded: 'CleanPro Services',
    amount: 72000,
    submittedBy: 'Karan Verma',
    status: 'rejected',
    date: '2024-05-22',
    currentStep: 1,
    vendor: {
      name: 'CleanPro Services',
      total: 72000,
      delivery: '7 days',
      rating: 3,
    },
    approvalChain: [
      { name: 'Karan Verma', role: 'Requester', status: 'approved', avatar: 'KV' },
      { name: 'Meena Iyer', role: 'L1 Approver – Finance', status: 'rejected', avatar: 'MI' },
      { name: 'Arjun Nair', role: 'L2 Approver – VP Ops', status: 'pending', avatar: 'AN' },
      { name: 'System', role: 'PO Generator', status: 'pending', avatar: 'SY' },
    ],
  },
  {
    id: 'APR-004',
    rfq: 'Pantry Supplies Q2',
    rfqId: 'RFQ-2024-0091',
    vendorAwarded: 'FreshMart Wholesale',
    amount: 38750,
    submittedBy: 'Sneha Pillai',
    status: 'pending',
    date: '2024-06-03',
    currentStep: 1,
    vendor: {
      name: 'FreshMart Wholesale',
      total: 38750,
      delivery: '5 days',
      rating: 4,
    },
    approvalChain: [
      { name: 'Sneha Pillai', role: 'Requester', status: 'approved', avatar: 'SP' },
      { name: 'Meena Iyer', role: 'L1 Approver – Finance', status: 'in_progress', avatar: 'MI' },
      { name: 'Arjun Nair', role: 'L2 Approver – VP Ops', status: 'pending', avatar: 'AN' },
      { name: 'System', role: 'PO Generator', status: 'pending', avatar: 'SY' },
    ],
  },
  {
    id: 'APR-005',
    rfq: 'Security Equipment',
    rfqId: 'RFQ-2024-0055',
    vendorAwarded: 'SafeGuard Corp.',
    amount: 210600,
    submittedBy: 'Anand Kumar',
    status: 'approved',
    date: '2024-05-15',
    currentStep: 3,
    vendor: {
      name: 'SafeGuard Corp.',
      total: 210600,
      delivery: '30 days',
      rating: 5,
    },
    approvalChain: [
      { name: 'Anand Kumar', role: 'Requester', status: 'approved', avatar: 'AK' },
      { name: 'Meena Iyer', role: 'L1 Approver – Finance', status: 'approved', avatar: 'MI' },
      { name: 'Arjun Nair', role: 'L2 Approver – VP Ops', status: 'approved', avatar: 'AN' },
      { name: 'System', role: 'PO Generator', status: 'approved', avatar: 'SY' },
    ],
  },
];

// ─── Workflow Steps Config ────────────────────────────────────────────────────
const WORKFLOW_STEPS = [
  { label: 'Submitted', icon: FileText },
  { label: 'L1 Review', icon: User },
  { label: 'L2 Approved', icon: CheckCircle },
  { label: 'Generate PO', icon: Truck },
];

// ─── Helper: Status icon ──────────────────────────────────────────────────────
const chainStatusIcon = (status) => {
  if (status === 'approved')
    return <CheckCircle size={16} className="text-green-400 flex-shrink-0" />;
  if (status === 'in_progress')
    return <Clock size={16} className="text-yellow-400 flex-shrink-0" />;
  if (status === 'rejected')
    return <XCircle size={16} className="text-red-400 flex-shrink-0" />;
  return <div className="w-4 h-4 rounded-full border border-gray-600 flex-shrink-0" />;
};

const chainStatusLabel = (status) => {
  if (status === 'approved') return 'Approved';
  if (status === 'in_progress') return 'In Review';
  if (status === 'rejected') return 'Rejected';
  return 'Pending';
};

// ─── Star Rating ──────────────────────────────────────────────────────────────
const StarRating = ({ rating, max = 5 }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: max }).map((_, i) => (
      <Star
        key={i}
        size={14}
        className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
      />
    ))}
  </div>
);

// ─── Approval Detail Modal ────────────────────────────────────────────────────
const ApprovalModal = ({ approval, onClose, onApprove, onReject }) => {
  const [remarks, setRemarks] = useState('');

  const handleApprove = () => {
    onApprove(approval.id, remarks);
  };

  const handleReject = () => {
    if (!remarks.trim()) {
      toast.error('Please provide remarks before rejecting.');
      return;
    }
    onReject(approval.id, remarks);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal-box"
        style={{ maxWidth: '820px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 24 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h2 className="text-xl font-semibold text-white">Approval Workflow</h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              RFQ: {approval.rfq} &mdash; Vendor: {approval.vendorAwarded} &mdash;{' '}
              <span className="text-blue-400 font-medium">
                ₹{approval.amount.toLocaleString('en-IN')}
              </span>
            </p>
          </div>
          <button className="btn btn-ghost p-2" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body space-y-6">
          {/* ── Horizontal Stepper ─────────────────────────────────────────── */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Workflow Progress
            </h3>
            <div className="relative flex items-center justify-between">
              {/* connecting line */}
              <div
                className="absolute top-5 left-0 right-0 h-0.5"
                style={{ background: 'rgba(59,130,246,0.15)', zIndex: 0 }}
              />
              {/* progress fill */}
              <div
                className="absolute top-5 left-0 h-0.5 transition-all duration-500"
                style={{
                  background: 'linear-gradient(90deg, #22c55e, #3B82F6)',
                  width: `${(approval.currentStep / (WORKFLOW_STEPS.length - 1)) * 100}%`,
                  zIndex: 0,
                }}
              />

              {WORKFLOW_STEPS.map((step, idx) => {
                const isDone = idx < approval.currentStep;
                const isActive = idx === approval.currentStep;
                const Icon = step.icon;

                return (
                  <div
                    key={idx}
                    className="relative z-10 flex flex-col items-center gap-2"
                    style={{ flex: 1 }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all"
                      style={{
                        background: isDone
                          ? '#22c55e'
                          : isActive
                          ? '#f59e0b'
                          : 'var(--bg-card)',
                        borderColor: isDone
                          ? '#22c55e'
                          : isActive
                          ? '#f59e0b'
                          : 'rgba(59,130,246,0.25)',
                      }}
                    >
                      {isDone ? (
                        <CheckCircle size={18} className="text-white" />
                      ) : isActive ? (
                        <Clock size={18} className="text-white" />
                      ) : (
                        <Icon size={16} className="text-gray-500" />
                      )}
                    </div>
                    <span
                      className="text-xs font-medium text-center leading-tight"
                      style={{
                        color: isDone ? '#22c55e' : isActive ? '#f59e0b' : 'var(--text-muted)',
                      }}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Two Columns ──────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Approval Chain */}
            <div className="glass-card p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <User size={14} className="text-blue-400" />
                Approval Chain
              </h3>
              <div className="space-y-3">
                {approval.approvalChain.map((approver, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    {/* Avatar */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, #3B82F655, #3B82F622)',
                        border: '1px solid rgba(59,130,246,0.35)',
                        color: '#a89fff',
                      }}
                    >
                      {approver.avatar}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{approver.name}</p>
                      <p className="text-xs text-gray-500 truncate">{approver.role}</p>
                    </div>
                    {/* Status */}
                    <div className="flex items-center gap-1.5">
                      {chainStatusIcon(approver.status)}
                      <span
                        className="text-xs"
                        style={{
                          color:
                            approver.status === 'approved'
                              ? '#4ade80'
                              : approver.status === 'in_progress'
                              ? '#fbbf24'
                              : approver.status === 'rejected'
                              ? '#f87171'
                              : '#6b7280',
                        }}
                      >
                        {chainStatusLabel(approver.status)}
                      </span>
                    </div>
                    {/* Connector arrow (not last) */}
                    {idx < approval.approvalChain.length - 1 && (
                      <ChevronRight size={14} className="text-gray-600 hidden" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quotation Summary */}
            <div className="glass-card p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <FileText size={14} className="text-blue-400" />
                Quotation Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-400">Vendor</span>
                  <span className="text-sm text-white font-medium text-right max-w-[55%]">
                    {approval.vendor.name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total Amount</span>
                  <span className="text-base font-bold text-blue-400">
                    ₹{approval.vendor.total.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400 flex items-center gap-1">
                    <Truck size={13} />
                    Delivery
                  </span>
                  <span className="text-sm text-white">{approval.vendor.delivery}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400 flex items-center gap-1">
                    <Star size={13} />
                    Rating
                  </span>
                  <StarRating rating={approval.vendor.rating} />
                </div>
                {/* Divider */}
                <div style={{ borderTop: '1px solid rgba(59,130,246,0.15)' }} />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">RFQ ID</span>
                  <span className="text-sm font-mono text-blue-300">{approval.rfqId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Submitted By</span>
                  <span className="text-sm text-white">{approval.submittedBy}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Date</span>
                  <span className="text-sm text-white">{formatDate(approval.date)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Approval Remarks ─────────────────────────────────────────────── */}
          <div>
            <label className="form-label flex items-center gap-2 mb-2">
              <AlertCircle size={14} className="text-yellow-400" />
              Approval Remarks
            </label>
            <textarea
              className="form-input w-full resize-none"
              rows={3}
              placeholder="Add your remarks or comments for this approval decision…"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              style={{ minHeight: '80px' }}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer flex justify-end gap-3">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-danger flex items-center gap-2"
            onClick={handleReject}
          >
            <ThumbsDown size={15} />
            Reject
          </button>
          <button
            className="btn btn-success flex items-center gap-2"
            onClick={handleApprove}
          >
            <ThumbsUp size={15} />
            Approve
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Filter Tabs Config ───────────────────────────────────────────────────────
const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Approvals() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [approvals, setApprovals] = useState(MOCK_APPROVALS);
  const [selectedApproval, setSelectedApproval] = useState(null);

  // Counts per tab
  const counts = useMemo(
    () => ({
      all: approvals.length,
      pending: approvals.filter((a) => a.status === 'pending').length,
      approved: approvals.filter((a) => a.status === 'approved').length,
      rejected: approvals.filter((a) => a.status === 'rejected').length,
    }),
    [approvals]
  );

  // Filtered rows
  const filtered = useMemo(
    () =>
      activeFilter === 'all'
        ? approvals
        : approvals.filter((a) => a.status === activeFilter),
    [approvals, activeFilter]
  );

  const handleApprove = (id, remarks) => {
    setApprovals((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'approved',
              currentStep: 3,
              approvalChain: a.approvalChain.map((c) => ({ ...c, status: 'approved' })),
            }
          : a
      )
    );
    toast.success('Approval granted successfully!');
    setSelectedApproval(null);
  };

  const handleReject = (id, remarks) => {
    setApprovals((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'rejected',
              approvalChain: a.approvalChain.map((c, i) =>
                i === a.currentStep ? { ...c, status: 'rejected' } : c
              ),
            }
          : a
      )
    );
    toast.error('Approval rejected.');
    setSelectedApproval(null);
  };

  // Row status badge
  const statusBadge = (status) => {
    const map = {
      pending: 'badge badge-pending',
      approved: 'badge badge-active',
      rejected: 'badge badge-danger',
    };
    return (
      <span className={map[status] || 'badge'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="page-container">
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-2xl font-bold gradient-text">Approvals</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Manage procurement approval workflows
          </p>
        </div>
        {/* Summary badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="glass-card px-3 py-1.5 flex items-center gap-2">
            <Clock size={14} className="text-yellow-400" />
            <span className="text-sm text-gray-300">
              <span className="font-bold text-yellow-400">{counts.pending}</span> Pending
            </span>
          </div>
          <div className="glass-card px-3 py-1.5 flex items-center gap-2">
            <CheckCircle size={14} className="text-green-400" />
            <span className="text-sm text-gray-300">
              <span className="font-bold text-green-400">{counts.approved}</span> Approved
            </span>
          </div>
          <div className="glass-card px-3 py-1.5 flex items-center gap-2">
            <XCircle size={14} className="text-red-400" />
            <span className="text-sm text-gray-300">
              <span className="font-bold text-red-400">{counts.rejected}</span> Rejected
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Filter Tabs ──────────────────────────────────────────────────────── */}
      <motion.div
        className="flex gap-1 mb-5"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '4px',
          width: 'fit-content',
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className="relative px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2"
            style={{
              color: activeFilter === tab.key ? '#fff' : 'var(--text-muted)',
              background: activeFilter === tab.key ? 'var(--primary)' : 'transparent',
            }}
          >
            {tab.label}
            {counts[tab.key] > 0 && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                style={{
                  background:
                    activeFilter === tab.key ? 'rgba(255,255,255,0.2)' : 'rgba(59,130,246,0.2)',
                  color: activeFilter === tab.key ? '#fff' : '#a89fff',
                  minWidth: '20px',
                  textAlign: 'center',
                }}
              >
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </motion.div>

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>RFQ</th>
                <th>Vendor Awarded</th>
                <th>Amount</th>
                <th>Submitted By</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-500">
                      No approvals found for this filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row, idx) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2, delay: idx * 0.04 }}
                    >
                      <td>
                        <div>
                          <p className="font-medium text-white text-sm">{row.rfq}</p>
                          <p className="text-xs text-gray-500 font-mono">{row.rfqId}</p>
                        </div>
                      </td>
                      <td className="text-sm text-gray-300">{row.vendorAwarded}</td>
                      <td className="text-sm font-semibold text-blue-300">
                        ₹{row.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="text-sm text-gray-300">{row.submittedBy}</td>
                      <td>{statusBadge(row.status)}</td>
                      <td className="text-sm text-gray-400">{formatDate(row.date)}</td>
                      <td>
                        <button
                          className="btn btn-ghost flex items-center gap-1.5 text-sm px-3 py-1.5"
                          onClick={() => setSelectedApproval(row)}
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p className="text-sm text-gray-500">
            Showing{' '}
            <span className="font-semibold text-gray-300">{filtered.length}</span> of{' '}
            <span className="font-semibold text-gray-300">{approvals.length}</span> approvals
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 rounded-full bg-yellow-400" /> Pending
            <div className="w-2 h-2 rounded-full bg-green-400 ml-2" /> Approved
            <div className="w-2 h-2 rounded-full bg-red-400 ml-2" /> Rejected
          </div>
        </div>
      </motion.div>

      {/* ── Approval Detail Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedApproval && (
          <ApprovalModal
            approval={selectedApproval}
            onClose={() => setSelectedApproval(null)}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

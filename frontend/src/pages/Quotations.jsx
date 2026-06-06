import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Eye,
  GitCompare,
  X,
  ChevronDown,
  Filter,
  Search,
  Package,
  DollarSign,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Calculator,
  Send,
  ClipboardList,
} from 'lucide-react';
import { quotationsAPI } from '../services/api';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../lib/utils';

/* ─────────────────────────── MOCK DATA ─────────────────────────── */

const MOCK_QUOTATIONS = [
  {
    id: 'QT-001',
    rfqId: 'RFQ-101',
    rfqTitle: 'Office Furniture Procurement Q2',
    vendor: 'ErgoFurni Supplies Ltd.',
    vendorId: 'V-01',
    grandTotal: 128500,
    deliveryDays: 14,
    status: 'pending',
    submittedDate: '2025-06-28',
    taxPercent: 18,
    subtotal: 108898,
    note: 'Delivery includes assembly service at no extra cost.',
  },
  {
    id: 'QT-002',
    rfqId: 'RFQ-101',
    rfqTitle: 'Office Furniture Procurement Q2',
    vendor: 'WorkSpace Pro',
    vendorId: 'V-02',
    grandTotal: 135200,
    deliveryDays: 10,
    status: 'pending',
    submittedDate: '2025-06-29',
    taxPercent: 18,
    subtotal: 114576,
    note: 'Premium warranty of 3 years on all furniture.',
  },
  {
    id: 'QT-003',
    rfqId: 'RFQ-101',
    rfqTitle: 'Office Furniture Procurement Q2',
    vendor: 'ModernOffice Co.',
    vendorId: 'V-03',
    grandTotal: 119750,
    deliveryDays: 21,
    status: 'accepted',
    submittedDate: '2025-06-27',
    taxPercent: 18,
    subtotal: 101483,
    note: 'Bulk discount applied. Lead time 3 weeks.',
  },
  {
    id: 'QT-004',
    rfqId: 'RFQ-205',
    rfqTitle: 'IT Hardware Refresh 2025',
    vendor: 'TechGear Solutions',
    vendorId: 'V-04',
    grandTotal: 482000,
    deliveryDays: 7,
    status: 'pending',
    submittedDate: '2025-07-01',
    taxPercent: 18,
    subtotal: 408475,
    note: 'All units come with 1-year on-site support.',
  },
  {
    id: 'QT-005',
    rfqId: 'RFQ-310',
    rfqTitle: 'Cleaning & Janitorial Supplies',
    vendor: 'CleanTech Distributors',
    vendorId: 'V-05',
    grandTotal: 34200,
    deliveryDays: 5,
    status: 'rejected',
    submittedDate: '2025-06-25',
    taxPercent: 5,
    subtotal: 32571,
    note: 'Monthly restocking available on contract.',
  },
];

const RFQ_ITEMS = [
  { id: 1, item: 'Executive Office Chair', description: 'Ergonomic, lumbar support', qty: 10, unit: 'pcs' },
  { id: 2, item: 'L-Shaped Work Desk', description: '180cm x 120cm, oak finish', qty: 6, unit: 'pcs' },
  { id: 3, item: '4-Door Filing Cabinet', description: 'Steel, lockable', qty: 4, unit: 'pcs' },
  { id: 4, item: 'Conference Table (8-seater)', description: 'Walnut veneer top', qty: 2, unit: 'pcs' },
  { id: 5, item: 'Visitor Chair', description: 'Stackable, fabric upholstery', qty: 20, unit: 'pcs' },
];

const STATUS_OPTIONS = ['all', 'pending', 'accepted', 'rejected', 'under_review'];

const RFQ_OPTIONS = [
  { value: 'all', label: 'All RFQs' },
  { value: 'RFQ-101', label: 'Office Furniture Procurement Q2' },
  { value: 'RFQ-205', label: 'IT Hardware Refresh 2025' },
  { value: 'RFQ-310', label: 'Cleaning & Janitorial Supplies' },
];

/* ─────────────────────── STATUS BADGE HELPER ─────────────────────── */

const statusConfig = {
  pending: { icon: Clock, label: 'Pending', className: 'badge badge-pending' },
  accepted: { icon: CheckCircle, label: 'Accepted', className: 'badge badge-active' },
  rejected: { icon: XCircle, label: 'Rejected', className: 'badge badge-danger' },
  under_review: { icon: AlertCircle, label: 'Under Review', className: 'badge badge-warning' },
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.pending;
  const Icon = cfg.icon;
  return (
    <span className={cfg.className} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

/* ─────────────────────── VIEW DETAILS MODAL ─────────────────────── */

function ViewDetailsModal({ quotation, onClose }) {
  if (!quotation) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal-box"
        style={{ maxWidth: 560 }}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
      >
        <div className="modal-header">
          <div>
            <h2 style={{ margin: 0, fontSize: 18 }}>{quotation.id}</h2>
            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>
              {quotation.rfqTitle}
            </p>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '6px 8px' }}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Vendor', value: quotation.vendor },
              { label: 'Status', value: <StatusBadge status={quotation.status} /> },
              { label: 'Submitted', value: formatDate(quotation.submittedDate) },
              { label: 'Delivery Days', value: `${quotation.deliveryDays} days` },
              { label: 'Subtotal', value: formatCurrency(quotation.subtotal) },
              { label: 'Tax/GST', value: `${quotation.taxPercent}%` },
              { label: 'Grand Total', value: <strong style={{ color: 'var(--primary)' }}>{formatCurrency(quotation.grandTotal)}</strong> },
            ].map(({ label, value }) => (
              <div key={label} className="glass-card" style={{ padding: '10px 14px' }}>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                <p style={{ margin: '4px 0 0', fontSize: 14 }}>{value}</p>
              </div>
            ))}
          </div>
          {quotation.note && (
            <div className="glass-card" style={{ padding: '12px 14px' }}>
              <p style={{ margin: '0 0 6px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Note / Terms</p>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>{quotation.note}</p>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────── SUBMIT QUOTATION MODAL ─────────────────── */

function SubmitQuotationModal({ onClose, onSubmit }) {
  const [rows, setRows] = useState(
    RFQ_ITEMS.map((item) => ({ ...item, unitPrice: '', deliveryDays: '' }))
  );
  const [taxPercent, setTaxPercent] = useState('18');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const subtotal = useMemo(
    () => rows.reduce((sum, r) => sum + (parseFloat(r.unitPrice) || 0) * r.qty, 0),
    [rows]
  );
  const gstAmount = useMemo(() => (subtotal * (parseFloat(taxPercent) || 0)) / 100, [subtotal, taxPercent]);
  const grandTotal = useMemo(() => subtotal + gstAmount, [subtotal, gstAmount]);

  const updateRow = (id, field, value) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleSubmit = async () => {
    const hasAllPrices = rows.every((r) => r.unitPrice !== '' && parseFloat(r.unitPrice) >= 0);
    if (!hasAllPrices) {
      alert('Please enter a unit price for all items.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        rfqId: 'RFQ-101',
        items: rows.map((r) => ({
          itemId: r.id,
          item: r.item,
          qty: r.qty,
          unitPrice: parseFloat(r.unitPrice),
          total: parseFloat(r.unitPrice) * r.qty,
          deliveryDays: parseInt(r.deliveryDays) || 0,
        })),
        taxPercent: parseFloat(taxPercent) || 0,
        subtotal,
        gstAmount,
        grandTotal,
        note,
      };
      try {
        await quotationsAPI.submit(payload);
      } catch {
        // API not available, proceed with mock success
      }
      onSubmit({ ...payload, id: `QT-00${Date.now()}`, status: 'pending', submittedDate: new Date().toISOString().slice(0, 10) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal-box"
        style={{ maxWidth: 900, width: '95vw', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.22 }}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={18} color="var(--primary)" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18 }}>Submit Quotation</h2>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                Office Furniture Procurement Q2 — Deadline: July 15, 2025
              </p>
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '6px 8px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20, alignItems: 'start' }}>

            {/* LEFT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* RFQ Summary */}
              <div className="glass-card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <ClipboardList size={15} color="var(--primary)" />
                  <h4 style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>RFQ Summary — Items Requested</h4>
                </div>
                <table className="data-table" style={{ fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Item</th>
                      <th>Description</th>
                      <th style={{ textAlign: 'center' }}>Qty</th>
                      <th>Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RFQ_ITEMS.map((item, idx) => (
                      <tr key={item.id}>
                        <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                        <td><strong>{item.item}</strong></td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{item.description}</td>
                        <td style={{ textAlign: 'center' }}>{item.qty}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{item.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Your Quotation */}
              <div className="glass-card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <DollarSign size={15} color="var(--primary)" />
                  <h4 style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>Your Quotation</h4>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table" style={{ fontSize: 13, minWidth: 540 }}>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th style={{ textAlign: 'center' }}>Qty</th>
                        <th>Unit Price (₹)</th>
                        <th>Total (₹)</th>
                        <th>Delivery (days)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => {
                        const total = (parseFloat(row.unitPrice) || 0) * row.qty;
                        return (
                          <tr key={row.id}>
                            <td>
                              <div>
                                <div style={{ fontWeight: 500 }}>{row.item}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.description}</div>
                              </div>
                            </td>
                            <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{row.qty}</td>
                            <td>
                              <input
                                type="number"
                                className="form-input"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                value={row.unitPrice}
                                onChange={(e) => updateRow(row.id, 'unitPrice', e.target.value)}
                                style={{ padding: '6px 10px', fontSize: 13, width: 110 }}
                              />
                            </td>
                            <td>
                              <span style={{ color: total > 0 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: total > 0 ? 600 : 400 }}>
                                {total > 0 ? `₹${total.toLocaleString('en-IN')}` : '—'}
                              </span>
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-input"
                                placeholder="Days"
                                min="1"
                                value={row.deliveryDays}
                                onChange={(e) => updateRow(row.id, 'deliveryDays', e.target.value)}
                                style={{ padding: '6px 10px', fontSize: 13, width: 80 }}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tax & Notes */}
              <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16 }}>
                <div>
                  <label className="form-label">Tax / GST (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 18"
                    min="0"
                    max="100"
                    step="0.5"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Note / Terms & Conditions</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Enter any notes, payment terms, warranty info, etc."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    style={{ resize: 'vertical', minHeight: 72 }}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN — Summary Card */}
            <div style={{ position: 'sticky', top: 0 }}>
              <div className="glass-card" style={{ padding: 20, border: '1px solid rgba(59,130,246,0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Calculator size={16} color="var(--primary)" />
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Quote Summary</h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                    <span>{subtotal > 0 ? `₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)' }}>GST ({taxPercent || 0}%)</span>
                    <span>{gstAmount > 0 ? `₹${gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}</span>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>Grand Total</span>
                      <span
                        className="gradient-text"
                        style={{ fontWeight: 700, fontSize: 20 }}
                      >
                        {grandTotal > 0
                          ? `₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : '₹0.00'}
                      </span>
                    </div>
                  </div>

                  {/* Item count */}
                  <div style={{ background: 'rgba(59,130,246,0.08)', borderRadius: 8, padding: '10px 14px', marginTop: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <Package size={13} color="var(--primary)" />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Line Items</span>
                    </div>
                    {rows.map((r) => {
                      const t = (parseFloat(r.unitPrice) || 0) * r.qty;
                      return (
                        <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>{r.item}</span>
                          <span style={{ color: t > 0 ? 'var(--text-primary)' : 'var(--text-muted)', flexShrink: 0, marginLeft: 6 }}>
                            {t > 0 ? `₹${t.toLocaleString('en-IN')}` : '—'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Delivery note */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 11, color: 'var(--text-muted)', background: 'rgba(255,193,7,0.06)', padding: '8px 12px', borderRadius: 8 }}>
                    <Truck size={12} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>Enter delivery days per item. Shortest lead time will be shown in the summary.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {submitting ? (
              <span className="spinner" style={{ width: 16, height: 16 }} />
            ) : (
              <Send size={15} />
            )}
            {submitting ? 'Submitting…' : 'Submit Quotation'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────── MAIN PAGE ─────────────────────────── */

export default function Quotations() {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState(MOCK_QUOTATIONS);
  const [filterRFQ, setFilterRFQ] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [viewingQuotation, setViewingQuotation] = useState(null);
  const [successBanner, setSuccessBanner] = useState(false);

  // Count quotations per RFQ to determine if Compare button should show
  const rfqCountMap = useMemo(() => {
    const map = {};
    quotations.forEach((q) => {
      map[q.rfqId] = (map[q.rfqId] || 0) + 1;
    });
    return map;
  }, [quotations]);

  const filtered = useMemo(() => {
    return quotations.filter((q) => {
      const matchRFQ = filterRFQ === 'all' || q.rfqId === filterRFQ;
      const matchStatus = filterStatus === 'all' || q.status === filterStatus;
      const matchSearch =
        !searchTerm ||
        q.rfqTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchRFQ && matchStatus && matchSearch;
    });
  }, [quotations, filterRFQ, filterStatus, searchTerm]);

  const handleSubmitSuccess = (newQuote) => {
    setQuotations((prev) => [
      {
        id: `QT-00${prev.length + 1}`,
        rfqId: 'RFQ-101',
        rfqTitle: 'Office Furniture Procurement Q2',
        vendor: 'Your Company',
        vendorId: 'V-MY',
        grandTotal: newQuote.grandTotal,
        deliveryDays: Math.min(...newQuote.items.map((i) => i.deliveryDays || 99)),
        status: 'pending',
        submittedDate: newQuote.submittedDate,
        taxPercent: newQuote.taxPercent,
        subtotal: newQuote.subtotal,
        note: newQuote.note,
      },
      ...prev,
    ]);
    setShowSubmitModal(false);
    setSuccessBanner(true);
    setTimeout(() => setSuccessBanner(false), 4000);
  };

  /* ── KPI Stats ── */
  const totalQuotations = quotations.length;
  const pendingCount = quotations.filter((q) => q.status === 'pending').length;
  const acceptedCount = quotations.filter((q) => q.status === 'accepted').length;
  const avgTotal = quotations.reduce((s, q) => s + q.grandTotal, 0) / (quotations.length || 1);

  return (
    <div className="page-container">
      {/* ── Success Banner ── */}
      <AnimatePresence>
        {successBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: 80,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9999,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 8px 32px rgba(16,185,129,0.35)',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            <CheckCircle size={18} />
            Quotation submitted successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="gradient-text" style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
            Quotations
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 14 }}>
            Manage and track all submitted vendor quotations
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowSubmitModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Plus size={16} />
          Submit Quotation
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Quotations', value: totalQuotations, icon: FileText, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
          { label: 'Pending Review', value: pendingCount, icon: Clock, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Accepted', value: acceptedCount, icon: CheckCircle, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Avg. Grand Total', value: `₹${Math.round(avgTotal).toLocaleString('en-IN')}`, icon: DollarSign, color: '#06B6D4', bg: 'rgba(6,182,212,0.1)' },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            className="kpi-card glass-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            style={{ padding: 18 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{kpi.label}</p>
                <p style={{ margin: '8px 0 0', fontSize: 24, fontWeight: 700, color: kpi.color }}>{kpi.value}</p>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <kpi.icon size={20} color={kpi.color} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Filters ── */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{ padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}
      >
        <Filter size={16} color="var(--primary)" style={{ flexShrink: 0 }} />

        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180, maxWidth: 300 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search quotations…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 34, fontSize: 13 }}
          />
        </div>

        {/* Filter by RFQ */}
        <div style={{ position: 'relative' }}>
          <select
            className="form-input"
            value={filterRFQ}
            onChange={(e) => setFilterRFQ(e.target.value)}
            style={{ fontSize: 13, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
          >
            {RFQ_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
        </div>

        {/* Filter by Status */}
        <div style={{ position: 'relative' }}>
          <select
            className="form-input"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ fontSize: 13, paddingRight: 32, appearance: 'none', cursor: 'pointer', textTransform: 'capitalize' }}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} style={{ textTransform: 'capitalize' }}>
                {s === 'all' ? 'All Statuses' : s.replace('_', ' ')}
              </option>
            ))}
          </select>
          <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
        </div>

        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </motion.div>

      {/* ── Quotations Table ── */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ overflow: 'hidden' }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Quotation ID</th>
                <th>RFQ Title</th>
                <th>Vendor</th>
                <th style={{ textAlign: 'right' }}>Grand Total</th>
                <th style={{ textAlign: 'center' }}>Delivery</th>
                <th>Status</th>
                <th>Submitted</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                      <FileText size={32} style={{ opacity: 0.3, marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
                      No quotations found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((q, idx) => (
                    <motion.tr
                      key={q.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: idx * 0.04 }}
                    >
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>
                          {q.id}
                        </span>
                      </td>
                      <td>
                        <div style={{ maxWidth: 200 }}>
                          <div style={{ fontWeight: 500, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {q.rfqTitle}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{q.rfqId}</div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13 }}>{q.vendor}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, fontSize: 14, color: '#10B981' }}>
                        {formatCurrency(q.grandTotal)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                          <Truck size={13} color="var(--text-muted)" />
                          {q.deliveryDays}d
                        </span>
                      </td>
                      <td><StatusBadge status={q.status} /></td>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{formatDate(q.submittedDate)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                          <button
                            className="btn btn-ghost"
                            onClick={() => setViewingQuotation(q)}
                            style={{ padding: '5px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                            title="View Details"
                          >
                            <Eye size={13} />
                            View
                          </button>
                          {rfqCountMap[q.rfqId] >= 3 && (
                            <button
                              className="btn btn-secondary"
                              onClick={() => navigate(`/quotations/compare/${q.rfqId}`)}
                              style={{ padding: '5px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                              title={`Compare all ${rfqCountMap[q.rfqId]} quotes for this RFQ`}
                            >
                              <GitCompare size={13} />
                              Compare
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {filtered.length > 0 && (
          <div style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 12,
            color: 'var(--text-muted)',
          }}>
            <span>Showing {filtered.length} of {quotations.length} quotations</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <GitCompare size={12} />
              Compare button appears when an RFQ has 3+ quotations
            </span>
          </div>
        )}
      </motion.div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showSubmitModal && (
          <SubmitQuotationModal
            onClose={() => setShowSubmitModal(false)}
            onSubmit={handleSubmitSuccess}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingQuotation && (
          <ViewDetailsModal
            quotation={viewingQuotation}
            onClose={() => setViewingQuotation(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

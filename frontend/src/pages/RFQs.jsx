import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  Upload,
  FileText,
  ChevronDown,
  PackageSearch,
  Users,
  CalendarDays,
  Tag,
  ClipboardList,
  Paperclip,
  CheckSquare,
  Square,
  Download,
  Mail,
} from 'lucide-react';
import { rfqsAPI } from '../services/api';
import { formatDate, getStatusBadgeClass } from '../lib/utils';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_RFQS = [
  {
    id: 'RFQ-2025-001',
    title: 'Office Furniture Procurement Q2',
    category: 'Furniture',
    deadline: '2025-07-15',
    status: 'Active',
    vendorsInvited: 5,
    quotationsReceived: 3,
  },
  {
    id: 'RFQ-2025-002',
    title: 'Laptop & Workstation Refresh',
    category: 'IT',
    deadline: '2025-07-22',
    status: 'Active',
    vendorsInvited: 8,
    quotationsReceived: 5,
  },
  {
    id: 'RFQ-2025-003',
    title: 'Warehouse Logistics Partner',
    category: 'Logistics',
    deadline: '2025-06-30',
    status: 'Closed',
    vendorsInvited: 4,
    quotationsReceived: 4,
  },
  {
    id: 'RFQ-2025-004',
    title: 'Annual HR Software Subscription',
    category: 'HR',
    deadline: '2025-08-10',
    status: 'Draft',
    vendorsInvited: 0,
    quotationsReceived: 0,
  },
  {
    id: 'RFQ-2025-005',
    title: 'Cafeteria Equipment Upgrade',
    category: 'Operations',
    deadline: '2025-07-05',
    status: 'Awarded',
    vendorsInvited: 6,
    quotationsReceived: 6,
  },
  {
    id: 'RFQ-2025-006',
    title: 'Network Infrastructure Overhaul',
    category: 'IT',
    deadline: '2025-09-01',
    status: 'Draft',
    vendorsInvited: 0,
    quotationsReceived: 0,
  },
];

const MOCK_VENDORS = [
  { id: 'v1', name: 'TechSupply Co.' },
  { id: 'v2', name: 'Global Furniture Ltd.' },
  { id: 'v3', name: 'SwiftLog Logistics' },
  { id: 'v4', name: 'NextGen IT Solutions' },
  { id: 'v5', name: 'Prime Office Supplies' },
  { id: 'v6', name: 'ErgoDesk Industries' },
  { id: 'v7', name: 'CloudHR Systems' },
  { id: 'v8', name: 'NetCore Infrastructure' },
];

const CATEGORIES = ['IT', 'Furniture', 'Logistics', 'HR', 'Operations', 'Other'];

const STATUS_COLORS = {
  Active: 'badge badge-active',
  Draft: 'badge badge-pending',
  Closed: 'badge badge-inactive',
  Awarded: 'badge badge-success',
};

// ─── Empty Line Item ──────────────────────────────────────────────────────────

const emptyLineItem = () => ({ id: Date.now() + Math.random(), item: '', qty: '', unit: '' });

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      style={{
        position: 'fixed',
        bottom: 28,
        right: 28,
        zIndex: 9999,
        background: type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3B82F6',
        color: '#fff',
        padding: '12px 22px',
        borderRadius: 10,
        fontWeight: 600,
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        minWidth: 240,
      }}
    >
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}>
        <X size={16} />
      </button>
    </motion.div>
  );
}

// ─── RFQ Detail Modal ─────────────────────────────────────────────────────────

function RFQDetailModal({ rfq, onClose, onShowToast }) {
  const [sendingEmail, setSendingEmail] = useState(false);

  // Generate mock line items based on category if none exist
  let items = rfq.lineItems || rfq.line_items || [];
  if (items.length === 0) {
    if (rfq.category === 'Furniture') {
      items = [
        { item: 'Ergonomic Office Chairs', qty: 25, unit: 'pcs' },
        { item: 'Executive Wooden Desks', qty: 10, unit: 'pcs' },
        { item: 'Conference Table (12-seater)', qty: 1, unit: 'pc' },
      ];
    } else if (rfq.category === 'IT') {
      items = [
        { item: 'Developer Laptops (16GB RAM)', qty: 15, unit: 'pcs' },
        { item: '27" 4K Monitors', qty: 20, unit: 'pcs' },
        { item: 'Dual-Band Wifi Routers', qty: 5, unit: 'pcs' },
      ];
    } else {
      items = [
        { item: 'Standard Office Supplies Bundle', qty: 50, unit: 'packs' },
        { item: 'A4 Paper Reams', qty: 100, unit: 'reams' },
      ];
    }
  }

  const handleDownloadPDF = async () => {
    try {
      const response = await rfqsAPI.getPDF(rfq.id);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${rfq.id}_RFQ.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      onShowToast('PDF Downloaded successfully!', 'success');
    } catch (e) {
      onShowToast('Failed to download PDF from server', 'error');
    }
  };

  const handleEmail = async () => {
    setSendingEmail(true);
    try {
      const emailToUse = 'gururajasohal2@gmail.com';
      await rfqsAPI.sendEmail(rfq.id, emailToUse);
      onShowToast(`RFQ emailed successfully to ${emailToUse}`, 'success');
    } catch (e) {
      onShowToast('Failed to email RFQ', 'error');
    }
    setSendingEmail(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <motion.div
        className="modal-box"
        style={{ maxWidth: 720, width: '95%' }}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.93, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 30 }}
        transition={{ duration: 0.25 }}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={20} color="#3B82F6" />
            <span style={{ fontWeight: 700, fontSize: 16 }}>Request For Quotation — {rfq.id}</span>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '4px 8px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Top Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            padding: '12px 24px',
            borderBottom: '1px solid rgba(59,130,246,0.15)',
            flexWrap: 'wrap',
          }}
        >
          <button className="btn btn-secondary" onClick={handleDownloadPDF} style={{ gap: 6, display: 'flex', alignItems: 'center' }}>
            <Download size={15} /> Download PDF
          </button>
          <button className="btn btn-primary" onClick={handleEmail} disabled={sendingEmail} style={{ gap: 6, display: 'flex', alignItems: 'center' }}>
            {sendingEmail ? <span className="spinner" style={{ width: 15, height: 15 }} /> : <Mail size={15} />}
            Email RFQ
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <div>
              <p style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>RFQ Details</p>
              <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 10, padding: '14px 16px' }}>
                <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{rfq.title}</p>
                <p style={{ fontSize: 13, color: '#aaa', lineHeight: 1.6 }}>
                  Category: {rfq.category}
                  <br />
                  Deadline: {rfq.deadline}
                  <br />
                  Status: <span className={`badge ${rfq.status === 'Active' ? 'badge-active' : rfq.status === 'Draft' ? 'badge-pending' : 'badge-inactive'}`}>{rfq.status}</span>
                </p>
              </div>
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Description</p>
              <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 10, padding: '14px 16px', minHeight: 90 }}>
                <p style={{ fontSize: 13, color: '#aaa', lineHeight: 1.6, margin: 0 }}>
                  {rfq.description || "Procurement of office furniture/supplies as per the specifications below."}
                </p>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Requested Items</p>
            <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item Description</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ color: '#888' }}>{idx + 1}</td>
                      <td style={{ fontWeight: 500 }}>{item.item}</td>
                      <td style={{ textAlign: 'center', color: '#aaa' }}>{item.qty}</td>
                      <td style={{ color: '#aaa' }}>{item.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────

function ConfirmDeleteModal({ rfq, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <motion.div
        className="modal-box"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        style={{ maxWidth: 420 }}
      >
        <div className="modal-header">
          <h3 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trash2 size={20} /> Delete RFQ
          </h3>
          <button className="btn btn-ghost" onClick={onCancel} style={{ padding: '4px 8px' }}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Are you sure you want to delete <strong style={{ color: '#fff' }}>{rfq.id} – {rfq.title}</strong>?
            This action cannot be undone.
          </p>
        </div>
        <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Create RFQ Modal ─────────────────────────────────────────────────────────

function CreateRFQModal({ onClose, onSaved }) {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    deadline: '',
    description: '',
  });
  const [lineItems, setLineItems] = useState([emptyLineItem()]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const handleField = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ── Line Items ──
  const addLineItem = () => setLineItems((prev) => [...prev, emptyLineItem()]);

  const updateLineItem = (id, field, value) => {
    setLineItems((prev) =>
      prev.map((li) => (li.id === id ? { ...li, [field]: value } : li))
    );
  };

  const removeLineItem = (id) => {
    setLineItems((prev) => (prev.length > 1 ? prev.filter((li) => li.id !== id) : prev));
  };

  // ── Vendors ──
  const toggleVendor = (id) => {
    setSelectedVendors((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  // ── File Upload ──
  const handleFiles = (files) => {
    const newFiles = Array.from(files).map((f) => ({ name: f.name, size: f.size, file: f }));
    setAttachments((prev) => [...prev, ...newFiles]);
  };

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Submit ──
  const handleSubmit = async (asDraft) => {
    if (!formData.title.trim()) { alert('Please enter an RFQ title.'); return; }
    setSaving(true);
    try {
      const payload = {
        ...formData,
        status: asDraft ? 'Draft' : 'Active',
        lineItems,
        vendorIds: selectedVendors,
      };
      await rfqsAPI.create(payload).catch(() => null); // fallback to mock on failure
      onSaved(payload, asDraft);
    } catch {
      onSaved(formData, asDraft);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1000, alignItems: 'flex-start', paddingTop: 24, paddingBottom: 24, overflowY: 'auto' }}>
      <motion.div
        className="modal-box"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -40, opacity: 0 }}
        style={{ maxWidth: 800, width: '100%', margin: 'auto' }}
      >
        {/* Header */}
        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 20 }}>
            <ClipboardList size={22} color="#3B82F6" />
            Create New RFQ
          </h2>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '4px 8px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Row 1: Title + Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={14} /> RFQ Title <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                className="form-input"
                name="title"
                value={formData.title}
                onChange={handleField}
                placeholder="e.g. Office Furniture Procurement Q3"
              />
            </div>
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Tag size={14} /> Category
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  className="form-input"
                  name="category"
                  value={formData.category}
                  onChange={handleField}
                  style={{ appearance: 'none', paddingRight: 36 }}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }} />
              </div>
            </div>
          </div>

          {/* Row 2: Deadline */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CalendarDays size={14} /> Deadline
              </label>
              <input
                className="form-input"
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleField}
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              name="description"
              value={formData.description}
              onChange={handleField}
              rows={3}
              placeholder="Describe the procurement requirements, specifications, terms..."
              style={{ resize: 'vertical', minHeight: 80 }}
            />
          </div>

          {/* Line Items */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <label className="form-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <PackageSearch size={14} /> Line Items
              </label>
              <button className="btn btn-secondary" onClick={addLineItem} style={{ padding: '6px 14px', fontSize: 13 }}>
                <Plus size={14} /> Add Line Item
              </button>
            </div>
            <div style={{
              border: '1px solid var(--border)',
              borderRadius: 10,
              overflow: 'hidden',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(59,130,246,0.08)' }}>
                    {['#', 'Item / Description', 'Qty', 'Unit', ''].map((h, i) => (
                      <th key={i} style={{
                        padding: '10px 14px',
                        textAlign: 'left',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: '1px solid var(--border)',
                        width: i === 0 ? 40 : i === 1 ? 'auto' : i === 2 ? 80 : i === 3 ? 100 : 44,
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((li, idx) => (
                    <tr key={li.id} style={{ borderBottom: idx < lineItems.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <td style={{ padding: '8px 14px', color: 'var(--text-secondary)', fontSize: 13 }}>{idx + 1}</td>
                      <td style={{ padding: '6px 8px 6px 14px' }}>
                        <input
                          className="form-input"
                          value={li.item}
                          onChange={(e) => updateLineItem(li.id, 'item', e.target.value)}
                          placeholder="e.g. Ergonomic Chair"
                          style={{ margin: 0 }}
                        />
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <input
                          className="form-input"
                          type="number"
                          min="1"
                          value={li.qty}
                          onChange={(e) => updateLineItem(li.id, 'qty', e.target.value)}
                          placeholder="0"
                          style={{ margin: 0, textAlign: 'center' }}
                        />
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <input
                          className="form-input"
                          value={li.unit}
                          onChange={(e) => updateLineItem(li.id, 'unit', e.target.value)}
                          placeholder="pcs"
                          style={{ margin: 0 }}
                        />
                      </td>
                      <td style={{ padding: '6px 8px 6px 0', textAlign: 'center' }}>
                        <button
                          onClick={() => removeLineItem(li.id)}
                          disabled={lineItems.length === 1}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: lineItems.length === 1 ? 'rgba(255,255,255,0.15)' : '#ef4444',
                            cursor: lineItems.length === 1 ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            padding: 4,
                          }}
                        >
                          <X size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Assign Vendors */}
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <Users size={14} /> Assign Vendors
              <span style={{ marginLeft: 6, color: '#3B82F6', fontSize: 12, fontWeight: 500 }}>
                ({selectedVendors.length} selected)
              </span>
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 10,
              padding: 16,
              background: 'rgba(59,130,246,0.04)',
              border: '1px solid var(--border)',
              borderRadius: 10,
            }}>
              {MOCK_VENDORS.map((vendor) => {
                const isSelected = selectedVendors.includes(vendor.id);
                return (
                  <button
                    key={vendor.id}
                    onClick={() => toggleVendor(vendor.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '9px 13px',
                      borderRadius: 8,
                      border: `1px solid ${isSelected ? '#3B82F6' : 'var(--border)'}`,
                      background: isSelected ? 'rgba(59,130,246,0.15)' : 'transparent',
                      color: isSelected ? '#3B82F6' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: isSelected ? 600 : 400,
                      transition: 'all 0.18s ease',
                      textAlign: 'left',
                    }}
                  >
                    {isSelected ? <CheckSquare size={15} /> : <Square size={15} />}
                    {vendor.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <Paperclip size={14} /> Attachments
            </label>
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragging ? '#3B82F6' : 'rgba(59,130,246,0.3)'}`,
                borderRadius: 12,
                padding: '28px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                background: isDragging ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.03)',
                transition: 'all 0.2s ease',
              }}
            >
              <Upload size={28} color={isDragging ? '#3B82F6' : 'rgba(59,130,246,0.5)'} style={{ marginBottom: 10 }} />
              <p style={{ color: isDragging ? '#3B82F6' : 'var(--text-secondary)', margin: 0, fontSize: 14 }}>
                {isDragging ? 'Drop files here...' : 'Drag & drop files here, or click to browse'}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.25)', margin: '4px 0 0', fontSize: 12 }}>
                PDF, DOCX, XLSX, PNG supported
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>
            {attachments.length > 0 && (
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {attachments.map((f, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 12px',
                      background: 'rgba(59,130,246,0.08)',
                      borderRadius: 8,
                      border: '1px solid rgba(59,130,246,0.2)',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                      <Paperclip size={13} color="#3B82F6" />
                      <span style={{ color: '#fff' }}>{f.name}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        ({(f.size / 1024).toFixed(1)} KB)
                      </span>
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeAttachment(idx); }}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: 12 }}>
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => handleSubmit(true)}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => handleSubmit(false)}
            disabled={saving}
          >
            {saving ? 'Sending...' : '📤 Save & Send to Vendors'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RFQs() {
  const [rfqs, setRfqs] = useState(MOCK_RFQS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaved = (payload, asDraft) => {
    const newRFQ = {
      id: `RFQ-${new Date().getFullYear()}-${String(rfqs.length + 1).padStart(3, '0')}`,
      title: payload.title || 'Untitled RFQ',
      category: payload.category || 'Other',
      deadline: payload.deadline || '—',
      status: asDraft ? 'Draft' : 'Active',
      vendorsInvited: asDraft ? 0 : (payload.vendorIds?.length || 0),
      quotationsReceived: 0,
    };
    setRfqs((prev) => [newRFQ, ...prev]);
    setShowCreateModal(false);
    showToast(
      asDraft
        ? `RFQ saved as Draft: ${newRFQ.id}`
        : `RFQ sent to ${newRFQ.vendorsInvited} vendor(s): ${newRFQ.id}`,
      'success'
    );
  };

  const handleDeleteConfirm = () => {
    setRfqs((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    showToast(`Deleted ${deleteTarget.id}`, 'error');
    setDeleteTarget(null);
  };

  const handleView = (rfq) => {
    setSelectedRFQ(rfq);
  };

  const handleEdit = (rfq) => {
    showToast(`Editing ${rfq.id} — opens inline editor (coming soon)`, 'info');
  };

  return (
    <div className="page-container">
      {/* ── Page Header ── */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}
      >
        <div>
          <h1 className="gradient-text" style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
            RFQ's
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>
            Manage Requests for Quotation — {rfqs.length} total
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Plus size={18} /> Create RFQ
        </button>
      </motion.div>

      {/* ── Stats Row ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 24 }}
      >
        {[
          { label: 'Total RFQs', value: rfqs.length, color: '#3B82F6' },
          { label: 'Active', value: rfqs.filter((r) => r.status === 'Active').length, color: '#22c55e' },
          { label: 'Draft', value: rfqs.filter((r) => r.status === 'Draft').length, color: '#f59e0b' },
          { label: 'Awarded', value: rfqs.filter((r) => r.status === 'Awarded').length, color: '#3b82f6' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="glass-card"
            style={{ padding: '16px 20px', borderLeft: `3px solid ${stat.color}` }}
          >
            <div style={{ fontSize: 26, fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* ── Table ── */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        style={{ overflow: 'hidden' }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: 860 }}>
            <thead>
              <tr>
                {['RFQ #', 'Title', 'Category', 'Deadline', 'Status', 'Vendors Invited', 'Quotes Received', 'Actions'].map(
                  (h) => (
                    <th key={h}>{h}</th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {rfqs.map((rfq, idx) => (
                <motion.tr
                  key={rfq.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * idx }}
                >
                  <td>
                    <span style={{ fontWeight: 600, color: '#3B82F6', fontFamily: 'monospace', fontSize: 13 }}>
                      {rfq.id}
                    </span>
                  </td>
                  <td style={{ maxWidth: 220 }}>
                    <span style={{ fontWeight: 500, color: '#fff', fontSize: 14 }}>{rfq.title}</span>
                  </td>
                  <td>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 500,
                      background: 'rgba(59,130,246,0.15)',
                      color: '#a78bfa',
                      border: '1px solid rgba(59,130,246,0.25)',
                    }}>
                      {rfq.category}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <CalendarDays size={13} />
                      {rfq.deadline !== '—' ? formatDate(rfq.deadline) : '—'}
                    </span>
                  </td>
                  <td>
                    <span className={STATUS_COLORS[rfq.status] || 'badge'}>
                      {rfq.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, color: 'var(--text-secondary)' }}>
                      <Users size={13} /> {rfq.vendorsInvited}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{
                      fontWeight: 700,
                      color: rfq.quotationsReceived > 0 ? '#22c55e' : 'var(--text-secondary)',
                    }}>
                      {rfq.quotationsReceived}
                    </span>
                    {rfq.vendorsInvited > 0 && (
                      <span style={{ color: 'var(--text-secondary)', fontSize: 12, marginLeft: 2 }}>
                        /{rfq.vendorsInvited}
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button
                        className="btn btn-ghost"
                        title="View"
                        onClick={() => handleView(rfq)}
                        style={{ padding: '5px 8px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <Eye size={14} /> View
                      </button>
                      {rfq.status === 'Draft' && (
                        <button
                          className="btn btn-secondary"
                          title="Edit"
                          onClick={() => handleEdit(rfq)}
                          style={{ padding: '5px 8px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <Pencil size={13} /> Edit
                        </button>
                      )}
                      <button
                        className="btn btn-danger"
                        title="Delete"
                        onClick={() => setDeleteTarget(rfq)}
                        style={{ padding: '5px 8px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {rfqs.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-secondary)' }}>
                    <PackageSearch size={36} style={{ opacity: 0.3, marginBottom: 10, display: 'block', margin: '0 auto 10px' }} />
                    No RFQs found. Click <strong style={{ color: '#3B82F6' }}>+ Create RFQ</strong> to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateRFQModal
            onClose={() => setShowCreateModal(false)}
            onSaved={handleSaved}
          />
        )}
        {deleteTarget && (
          <ConfirmDeleteModal
            rfq={deleteTarget}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
        {selectedRFQ && (
          <RFQDetailModal
            rfq={selectedRFQ}
            onClose={() => setSelectedRFQ(null)}
            onShowToast={showToast}
          />
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <Toast
            key="toast"
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

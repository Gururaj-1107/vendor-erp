import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, X, Eye, ShieldOff, Pencil, Building2,
  Phone, Mail, Hash, Tag, CheckCircle, Clock, AlertTriangle,
  ChevronDown, Save, Loader2
} from 'lucide-react';
import { vendorsAPI } from '../services/api';
import { getStatusBadgeClass, formatDate } from '../lib/utils';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_VENDORS = [
  {
    id: 1,
    name: 'TechCore Ltd',
    category: 'IT',
    gstNo: '27AABCS1429B1Z0',
    contactNo: '8583896838',
    email: 'procurement@techcore.in',
    status: 'active',
    registeredOn: '2024-01-15',
    address: '42, Andheri East, Mumbai – 400069',
  },
  {
    id: 2,
    name: 'FinServe Solutions',
    category: 'Finance',
    gstNo: '29AADCF2193K1ZP',
    contactNo: '9871234560',
    email: 'contact@finserve.co',
    status: 'active',
    registeredOn: '2024-02-20',
    address: '12, MG Road, Bengaluru – 560001',
  },
  {
    id: 3,
    name: 'HRConnect Pvt Ltd',
    category: 'HR',
    gstNo: '07AAECH3120M1ZK',
    contactNo: '9988776655',
    email: 'hr@hrconnect.in',
    status: 'pending',
    registeredOn: '2024-03-10',
    address: '88, Connaught Place, New Delhi – 110001',
  },
  {
    id: 4,
    name: 'OpsEdge Technologies',
    category: 'Operations',
    gstNo: '24AABCO1234C1ZQ',
    contactNo: '8001122334',
    email: 'ops@opsedge.com',
    status: 'active',
    registeredOn: '2024-04-05',
    address: '7, Paldi, Ahmedabad – 380007',
  },
  {
    id: 5,
    name: 'LogiFreight India',
    category: 'Logistics',
    gstNo: '33AABCL5678D1ZW',
    contactNo: '7760001234',
    email: 'logistics@logifreight.in',
    status: 'blocked',
    registeredOn: '2023-11-22',
    address: '5, Anna Salai, Chennai – 600002',
  },
  {
    id: 6,
    name: 'CloudNine Systems',
    category: 'IT',
    gstNo: '19AACCC9987F1Z3',
    contactNo: '9432100987',
    email: 'hello@cloudnine.io',
    status: 'pending',
    registeredOn: '2024-05-18',
    address: '30, Salt Lake, Kolkata – 700091',
  },
  {
    id: 7,
    name: 'PrimePath Logistics',
    category: 'Logistics',
    gstNo: '36AABCP4321E1ZR',
    contactNo: '9000123456',
    email: 'info@primepath.in',
    status: 'active',
    registeredOn: '2024-01-30',
    address: '14, Banjara Hills, Hyderabad – 500034',
  },
  {
    id: 8,
    name: 'GreenOps Corp',
    category: 'Operations',
    gstNo: '27AABCG8765H1ZT',
    contactNo: '8900034567',
    email: 'admin@greenops.co',
    status: 'active',
    registeredOn: '2023-12-01',
    address: '99, Viman Nagar, Pune – 411014',
  },
];

const CATEGORIES = ['IT', 'Finance', 'HR', 'Operations', 'Logistics'];

const EMPTY_FORM = {
  name: '',
  category: '',
  gstNo: '',
  contactNo: '',
  email: '',
  status: 'pending',
  address: '',
};

// ─── Tab counts ───────────────────────────────────────────────────────────────
function getCounts(vendors) {
  return {
    all: vendors.length,
    active: vendors.filter((v) => v.status === 'active').length,
    pending: vendors.filter((v) => v.status === 'pending').length,
    blocked: vendors.filter((v) => v.status === 'blocked').length,
  };
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colours = {
    success: '#22c55e',
    error: '#ef4444',
    info: '#3B82F6',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      style={{
        position: 'fixed',
        bottom: 28,
        right: 28,
        background: '#12122A',
        border: `1px solid ${colours[type]}55`,
        borderLeft: `4px solid ${colours[type]}`,
        borderRadius: 10,
        padding: '12px 20px',
        color: '#fff',
        fontSize: 14,
        zIndex: 9999,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        maxWidth: 320,
      }}
    >
      {message}
    </motion.div>
  );
}

// ─── Status Icon ──────────────────────────────────────────────────────────────
function StatusIcon({ status }) {
  if (status === 'active') return <CheckCircle size={14} color="#22c55e" style={{ marginRight: 4 }} />;
  if (status === 'pending') return <Clock size={14} color="#f59e0b" style={{ marginRight: 4 }} />;
  return <AlertTriangle size={14} color="#ef4444" style={{ marginRight: 4 }} />;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Vendors() {
  const [vendors, setVendors] = useState(MOCK_VENDORS);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [detailVendor, setDetailVendor] = useState(null);
  const [editVendor, setEditVendor] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Try API, fall back to mock silently
  useEffect(() => {
    vendorsAPI
      ?.getAll?.()
      .then((res) => {
        if (res?.data?.length) setVendors(res.data);
      })
      .catch(() => {});
  }, []);

  const counts = getCounts(vendors);

  // Filtered list
  const filtered = vendors.filter((v) => {
    const matchesTab =
      activeTab === 'all' || v.status === activeTab;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      v.name.toLowerCase().includes(q) ||
      v.gstNo.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q) ||
      v.contactNo.includes(q);
    return matchesTab && matchesSearch;
  });

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const showToast = (message, type = 'success') =>
    setToast({ message, type });

  const handleFormChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // ── Add Vendor ────────────────────────────────────────────────────────────
  const openAddModal = () => {
    setForm(EMPTY_FORM);
    setShowAddModal(true);
  };

  const handleAddVendor = async () => {
    if (!form.name || !form.category || !form.gstNo || !form.contactNo || !form.email) {
      showToast('Please fill all required fields.', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await vendorsAPI?.create?.(form);
      const newVendor = res?.data || { ...form, id: Date.now(), registeredOn: new Date().toISOString().slice(0, 10) };
      setVendors((prev) => [newVendor, ...prev]);
      setShowAddModal(false);
      showToast(`Vendor "${form.name}" added successfully.`);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to add vendor', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Block Vendor ──────────────────────────────────────────────────────────
  const handleBlock = (vendor) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendor.id ? { ...v, status: 'blocked' } : v))
    );
    setDetailVendor((prev) => (prev ? { ...prev, status: 'blocked' } : null));
    showToast(`Vendor "${vendor.name}" has been blocked.`, 'info');
  };

  // ── Edit Save ─────────────────────────────────────────────────────────────
  const openEditModal = (vendor) => {
    setEditVendor(vendor);
    setForm({ ...vendor });
    setDetailVendor(null);
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      const res = await vendorsAPI?.update?.(form.id, form);
      const updatedVendor = res?.data || form;
      setVendors((prev) => prev.map((v) => (v.id === form.id ? updatedVendor : v)));
      setEditVendor(null);
      showToast(`Vendor "${form.name}" updated.`);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update vendor', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const TABS = [
    { key: 'all', label: `All (${counts.all})` },
    { key: 'active', label: `Active (${counts.active})` },
    { key: 'pending', label: `Pending (${counts.pending})` },
    { key: 'blocked', label: `Blocked (${counts.blocked})` },
  ];

  return (
    <div className="page-container">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="gradient-text" style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>
            Vendors
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: '4px 0 0', fontSize: 14 }}>
            Manage supplier profiles and registrations
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="btn btn-primary"
          onClick={openAddModal}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Plus size={18} />
          Add Vendor
        </motion.button>
      </div>

      {/* ── Search + Filter ── */}
      <div
        className="glass-card"
        style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        {/* Search */}
        <div style={{ position: 'relative', maxWidth: 480 }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }}
          />
          <input
            className="form-input"
            placeholder="Search by name, GST no., category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 38, width: '100%' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '6px 16px',
                borderRadius: 20,
                border: activeTab === tab.key ? '1px solid #3B82F6' : '1px solid rgba(59,130,246,0.2)',
                background: activeTab === tab.key ? 'rgba(59,130,246,0.18)' : 'transparent',
                color: activeTab === tab.key ? '#3B82F6' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: activeTab === tab.key ? 600 : 400,
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ overflow: 'hidden' }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Vendor Name</th>
                <th>Category</th>
                <th>GST No.</th>
                <th>Contact No.</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.35)' }}>
                      No vendors found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((vendor, idx) => (
                    <motion.tr
                      key={vendor.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: idx * 0.04 }}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 10,
                              background: 'linear-gradient(135deg, #3B82F633, #3B82F611)',
                              border: '1px solid rgba(59,130,246,0.25)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Building2 size={16} color="#3B82F6" />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{vendor.name}</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{vendor.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: 6,
                            background: 'rgba(59,130,246,0.12)',
                            color: '#a49dff',
                            fontSize: 12,
                            fontWeight: 500,
                          }}
                        >
                          {vendor.category}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                        {vendor.gstNo}
                      </td>
                      <td style={{ fontSize: 13 }}>{vendor.contactNo}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(vendor.status)}`}
                          style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <StatusIcon status={vendor.status} />
                          {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <motion.button
                          whileHover={{ scale: 1.06 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-ghost"
                          onClick={() => setDetailVendor(vendor)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, padding: '5px 14px' }}
                        >
                          <Eye size={14} />
                          View
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        <div style={{ padding: '12px 20px', color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
          Showing {filtered.length} of {vendors.length} vendors
        </div>
      </motion.div>

      {/* ════════════════════════════════════════════════
          ADD VENDOR MODAL
      ════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <motion.div
              className="modal-box"
              style={{ maxWidth: 560 }}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Plus size={20} color="#3B82F6" />
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Add New Vendor</h2>
                </div>
                <button className="btn btn-ghost" onClick={() => setShowAddModal(false)} style={{ padding: '4px 8px' }}>
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Vendor Name */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Vendor Name *</label>
                  <input
                    className="form-input"
                    name="name"
                    placeholder="e.g. TechCore Ltd"
                    value={form.name}
                    onChange={handleFormChange}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="form-label">Category *</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      className="form-input"
                      name="category"
                      value={form.category}
                      onChange={handleFormChange}
                      style={{ appearance: 'none', paddingRight: 32 }}
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(255,255,255,0.4)' }} />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="form-label">Status *</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      className="form-input"
                      name="status"
                      value={form.status}
                      onChange={handleFormChange}
                      style={{ appearance: 'none', paddingRight: 32 }}
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(255,255,255,0.4)' }} />
                  </div>
                </div>

                {/* GST No. */}
                <div>
                  <label className="form-label">GST No. *</label>
                  <input
                    className="form-input"
                    name="gstNo"
                    placeholder="e.g. 27AABCS1429B1Z0"
                    value={form.gstNo}
                    onChange={handleFormChange}
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>

                {/* Contact No. */}
                <div>
                  <label className="form-label">Contact No. *</label>
                  <input
                    className="form-input"
                    name="contactNo"
                    placeholder="10-digit mobile"
                    value={form.contactNo}
                    onChange={handleFormChange}
                  />
                </div>

                {/* Email */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Email *</label>
                  <input
                    className="form-input"
                    name="email"
                    type="email"
                    placeholder="vendor@company.com"
                    value={form.email}
                    onChange={handleFormChange}
                  />
                </div>

                {/* Address */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Address</label>
                  <input
                    className="form-input"
                    name="address"
                    placeholder="Office address"
                    value={form.address}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <motion.button
                  className="btn btn-primary"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleAddVendor}
                  disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  {saving ? <Loader2 size={16} className="spin" /> : <Plus size={16} />}
                  {saving ? 'Adding...' : 'Add Vendor'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════
          VENDOR DETAIL MODAL
      ════════════════════════════════════════════════ */}
      <AnimatePresence>
        {detailVendor && (
          <div className="modal-overlay" onClick={() => setDetailVendor(null)}>
            <motion.div
              className="modal-box"
              style={{ maxWidth: 580 }}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: 'linear-gradient(135deg,#3B82F644,#3B82F611)',
                      border: '1px solid rgba(59,130,246,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Building2 size={20} color="#3B82F6" />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{detailVendor.name}</h2>
                    <span className={`badge ${getStatusBadgeClass(detailVendor.status)}`}
                      style={{ display: 'inline-flex', alignItems: 'center', marginTop: 2 }}>
                      <StatusIcon status={detailVendor.status} />
                      {detailVendor.status.charAt(0).toUpperCase() + detailVendor.status.slice(1)}
                    </span>
                  </div>
                </div>
                <button className="btn btn-ghost" onClick={() => setDetailVendor(null)} style={{ padding: '4px 8px' }}>
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { icon: <Tag size={15} color="#3B82F6" />, label: 'Category', value: detailVendor.category },
                    { icon: <Hash size={15} color="#3B82F6" />, label: 'GST No.', value: detailVendor.gstNo, mono: true },
                    { icon: <Phone size={15} color="#3B82F6" />, label: 'Contact No.', value: detailVendor.contactNo },
                    { icon: <Mail size={15} color="#3B82F6" />, label: 'Email', value: detailVendor.email },
                    { icon: <Building2 size={15} color="#3B82F6" />, label: 'Address', value: detailVendor.address || '—', span: true },
                    { icon: <CheckCircle size={15} color="#3B82F6" />, label: 'Registered On', value: formatDate ? formatDate(detailVendor.registeredOn) : detailVendor.registeredOn },
                  ].map((item, i) => (
                    <div
                      key={i}
                      style={{
                        gridColumn: item.span ? '1 / -1' : undefined,
                        background: 'rgba(59,130,246,0.06)',
                        border: '1px solid rgba(59,130,246,0.12)',
                        borderRadius: 10,
                        padding: '12px 14px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, color: 'rgba(255,255,255,0.45)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {item.icon}
                        {item.label}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 500, fontFamily: item.mono ? 'monospace' : undefined }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                {detailVendor.status !== 'blocked' && (
                  <motion.button
                    className="btn btn-danger"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleBlock(detailVendor)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <ShieldOff size={15} />
                    Block Vendor
                  </motion.button>
                )}
                <button className="btn btn-secondary" onClick={() => setDetailVendor(null)}>
                  Close
                </button>
                <motion.button
                  className="btn btn-primary"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => openEditModal(detailVendor)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Pencil size={15} />
                  Edit
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════
          EDIT VENDOR MODAL
      ════════════════════════════════════════════════ */}
      <AnimatePresence>
        {editVendor && (
          <div className="modal-overlay" onClick={() => setEditVendor(null)}>
            <motion.div
              className="modal-box"
              style={{ maxWidth: 560 }}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Pencil size={18} color="#3B82F6" />
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Edit Vendor</h2>
                </div>
                <button className="btn btn-ghost" onClick={() => setEditVendor(null)} style={{ padding: '4px 8px' }}>
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Vendor Name *</label>
                  <input className="form-input" name="name" value={form.name} onChange={handleFormChange} />
                </div>

                <div>
                  <label className="form-label">Category *</label>
                  <div style={{ position: 'relative' }}>
                    <select className="form-input" name="category" value={form.category} onChange={handleFormChange} style={{ appearance: 'none', paddingRight: 32 }}>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(255,255,255,0.4)' }} />
                  </div>
                </div>

                <div>
                  <label className="form-label">Status</label>
                  <div style={{ position: 'relative' }}>
                    <select className="form-input" name="status" value={form.status} onChange={handleFormChange} style={{ appearance: 'none', paddingRight: 32 }}>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="blocked">Blocked</option>
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(255,255,255,0.4)' }} />
                  </div>
                </div>

                <div>
                  <label className="form-label">GST No. *</label>
                  <input className="form-input" name="gstNo" value={form.gstNo} onChange={handleFormChange} style={{ fontFamily: 'monospace' }} />
                </div>

                <div>
                  <label className="form-label">Contact No. *</label>
                  <input className="form-input" name="contactNo" value={form.contactNo} onChange={handleFormChange} />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Email *</label>
                  <input className="form-input" name="email" type="email" value={form.email} onChange={handleFormChange} />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Address</label>
                  <input className="form-input" name="address" value={form.address} onChange={handleFormChange} />
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setEditVendor(null)}>Cancel</button>
                <motion.button
                  className="btn btn-primary"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleEditSave}
                  disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Spin keyframes */}
      <style>{`
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, FileText, Eye, Download, Printer, Mail, X, CheckCircle, Package, IndianRupee, Calendar, Building2, Hash, FileSpreadsheet
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../lib/utils';
import { purchaseOrdersAPI, invoicesAPI } from '../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

/* ─────────────────────────── Mock Data ─────────────────────────── */

const MOCK_POS = [
  {
    id: 'PO-2025-001',
    vendor: 'InfraSupplies Ltd',
    vendorAddress: '42, Industrial Estate, Mumbai - 400 001',
    vendorEmail: 'accounts@infrasupplies.in',
    vendorGST: '27AABCI1234A1Z5',
    amount: 185400,
    poDate: '2025-06-01',
    invoiceDate: '2025-06-05',
    dueDate: '2025-07-05',
    status: 'Approved',
    items: [
      { name: 'Steel Pipes (20 ft)', qty: 50, unitPrice: 1800, total: 90000 },
      { name: 'MS Angles (6 m)', qty: 30, unitPrice: 1200, total: 36000 },
      { name: 'Welding Electrodes (Box)', qty: 20, unitPrice: 950, total: 19000 },
      { name: 'Safety Helmets', qty: 25, unitPrice: 480, total: 12000 },
    ],
  },
  {
    id: 'PO-2025-002',
    vendor: 'TechParts India Pvt Ltd',
    vendorAddress: '18, Tech Park, Bengaluru - 560 001',
    vendorEmail: 'billing@techparts.in',
    vendorGST: '29AABCT5678B1Z2',
    amount: 94600,
    poDate: '2025-06-04',
    invoiceDate: '2025-06-06',
    dueDate: '2025-07-06',
    status: 'Pending',
    items: [
      { name: 'Servo Motors (5A)', qty: 10, unitPrice: 4200, total: 42000 },
      { name: 'Control Boards', qty: 8, unitPrice: 3800, total: 30400 },
      { name: 'Relay Modules', qty: 20, unitPrice: 275, total: 5500 },
    ],
  },
  {
    id: 'PO-2025-003',
    vendor: 'GreenBuild Materials',
    vendorAddress: '7, Green Complex, Pune - 411 001',
    vendorEmail: 'orders@greenbuild.co.in',
    vendorGST: '27AABCG9012C1Z8',
    amount: 242000,
    poDate: '2025-05-28',
    invoiceDate: '2025-06-01',
    dueDate: '2025-07-01',
    status: 'Approved',
    items: [
      { name: 'Portland Cement (50 kg bags)', qty: 200, unitPrice: 420, total: 84000 },
      { name: 'River Sand (MT)', qty: 30, unitPrice: 1800, total: 54000 },
      { name: 'Fly Ash Bricks (1000)', qty: 50, unitPrice: 2080, total: 104000 },
    ],
  },
  {
    id: 'PO-2025-004',
    vendor: 'SafetyFirst Equipment Co',
    vendorAddress: '3, Safety Lane, Hyderabad - 500 001',
    vendorEmail: 'supply@safetyfirst.in',
    vendorGST: '36AABCS3456D1Z4',
    amount: 58200,
    poDate: '2025-06-02',
    invoiceDate: '2025-06-08',
    dueDate: '2025-07-08',
    status: 'Draft',
    items: [
      { name: 'Safety Harness (Full Body)', qty: 15, unitPrice: 2200, total: 33000 },
      { name: 'Fire Extinguisher 5kg', qty: 10, unitPrice: 1350, total: 13500 },
      { name: 'First Aid Kit (Large)', qty: 5, unitPrice: 740, total: 3700 },
    ],
  },
  {
    id: 'PO-2025-005',
    vendor: 'LogiFreight Solutions',
    vendorAddress: '99, Logistics Hub, Delhi - 110 001',
    vendorEmail: 'freight@logifreight.in',
    vendorGST: '07AABCL7890E1Z6',
    amount: 31500,
    poDate: '2025-06-05',
    invoiceDate: '2025-06-07',
    dueDate: '2025-07-07',
    status: 'Rejected',
    items: [
      { name: 'Freight Charges (Mumbai–Delhi)', qty: 1, unitPrice: 18000, total: 18000 },
      { name: 'Handling & Packaging', qty: 1, unitPrice: 7500, total: 7500 },
      { name: 'Insurance Premium', qty: 1, unitPrice: 6000, total: 6000 },
    ],
  },
];

const MOCK_INVOICES = [
  {
    id: 'INV-2025-001',
    poNumber: 'PO-2025-001',
    vendor: 'InfraSupplies Ltd',
    amount: 185400,
    invoiceDate: '2025-06-05',
    dueDate: '2025-07-05',
    status: 'Paid',
  },
  {
    id: 'INV-2025-002',
    poNumber: 'PO-2025-002',
    vendor: 'TechParts India Pvt Ltd',
    amount: 94600,
    invoiceDate: '2025-06-06',
    dueDate: '2025-07-06',
    status: 'Pending',
  },
  {
    id: 'INV-2025-003',
    poNumber: 'PO-2025-003',
    vendor: 'GreenBuild Materials',
    amount: 242000,
    invoiceDate: '2025-06-01',
    dueDate: '2025-07-01',
    status: 'Overdue',
  },
  {
    id: 'INV-2025-004',
    poNumber: 'PO-2025-004',
    vendor: 'SafetyFirst Equipment Co',
    amount: 58200,
    invoiceDate: '2025-06-08',
    dueDate: '2025-07-08',
    status: 'Pending',
  },
  {
    id: 'INV-2025-005',
    poNumber: 'PO-2025-005',
    vendor: 'LogiFreight Solutions',
    amount: 31500,
    invoiceDate: '2025-06-07',
    dueDate: '2025-07-07',
    status: 'Paid',
  },
];

const COMPANY_INFO = {
  name: 'VendorBridge Pvt Ltd',
  address: '501, Prestige Towers, MG Road',
  city: 'Bengaluru – 560 001, Karnataka',
  gstin: '29AABCV1234F1Z9',
  email: 'procurement@vendorbridge.in',
  phone: '+91 80 4567 8901',
};

/* ─────────────────────────── Helpers ────────────────────────────── */

const GST_RATE = 0.18;

function calcTotals(items = []) {
  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const gst = subtotal * GST_RATE;
  return { subtotal, gst, grandTotal: subtotal + gst };
}

function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.textContent = msg;
  const colors = { info: '#3B82F6', success: '#22c55e', error: '#ef4444' };
  Object.assign(el.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    background: colors[type] || colors.info,
    color: '#fff',
    padding: '12px 20px',
    borderRadius: '10px',
    fontFamily: 'inherit',
    fontSize: '14px',
    fontWeight: '500',
    zIndex: 99999,
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    transition: 'opacity 0.3s',
    maxWidth: '320px',
  });
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 400);
  }, 3000);
}

function poStatusBadge(status) {
  const map = {
    Approved: 'badge-active',
    Pending: 'badge-pending',
    Draft: 'badge-info',
    Rejected: 'badge-danger',
  };
  return `badge ${map[status] || 'badge-pending'}`;
}

function invStatusBadge(status) {
  const map = {
    Paid: 'badge-active',
    Pending: 'badge-pending',
    Overdue: 'badge-danger',
  };
  return `badge ${map[status] || 'badge-pending'}`;
}

/* ──────────────────────── PO Detail Modal ───────────────────────── */

function PODetailModal({ po, onClose }) {
  const [sendingEmail, setSendingEmail] = useState(false);
  const { subtotal, gst, grandTotal } = calcTotals(po.items);

  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    try {
      const response = await purchaseOrdersAPI.getPDF(po.id);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${po.id}_PO.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast('PDF Downloaded successfully!', 'success');
    } catch (e) {
      toast('Failed to download PDF from server', 'error');
    }
  };

  const handleDownloadExcel = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
      ["PO Number", po.id],
      ["Vendor", po.vendor],
      ["Date", po.poDate],
      [],
      ["Item Description", "Qty", "Unit Price", "Total"]
    ];
    po.items.forEach(item => {
      wsData.push([item.name, item.qty, item.unitPrice, item.total]);
    });
    wsData.push([]);
    wsData.push(["", "", "Subtotal", subtotal]);
    wsData.push(["", "", "GST (18%)", gst]);
    wsData.push(["", "", "Grand Total", grandTotal]);

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Invoice");
    XLSX.writeFile(wb, `${po.id}_Invoice.xlsx`);
    toast('Excel Downloaded successfully!', 'success');
  };

  const handleEmail = async () => {
    setSendingEmail(true);
    try {
      const emailToUse = po.vendorEmail || 'gururajasohal2@gmail.com';
      await purchaseOrdersAPI.sendEmail(po.id, emailToUse);
      toast(`Invoice emailed successfully to ${emailToUse}`, 'success');
    } catch (e) {
      toast('Failed to email invoice', 'error');
    }
    setSendingEmail(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal-box"
        style={{ maxWidth: 780, width: '95%' }}
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
            <span style={{ fontWeight: 700, fontSize: 16 }}>Purchase Order — {po.id}</span>
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
            <Download size={15} /> PDF
          </button>
          <button className="btn btn-secondary" onClick={handleDownloadExcel} style={{ gap: 6, display: 'flex', alignItems: 'center' }}>
            <FileSpreadsheet size={15} /> Excel
          </button>
          <button className="btn btn-secondary" onClick={handlePrint} style={{ gap: 6, display: 'flex', alignItems: 'center' }}>
            <Printer size={15} /> Print
          </button>
          <button className="btn btn-primary" onClick={handleEmail} disabled={sendingEmail} style={{ gap: 6, display: 'flex', alignItems: 'center' }}>
            {sendingEmail ? <span className="spinner" style={{ width: 15, height: 15 }} /> : <Mail size={15} />}
            Email Invoice
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '20px 24px' }}>
          {/* Two-column header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 24,
              marginBottom: 24,
            }}
          >
            {/* Left: Bill To */}
            <div>
              <p style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                Bill To
              </p>
              <div
                style={{
                  background: 'rgba(59,130,246,0.06)',
                  border: '1px solid rgba(59,130,246,0.15)',
                  borderRadius: 10,
                  padding: '14px 16px',
                }}
              >
                <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{COMPANY_INFO.name}</p>
                <p style={{ fontSize: 13, color: '#aaa', lineHeight: 1.6 }}>
                  {COMPANY_INFO.address}
                  <br />
                  {COMPANY_INFO.city}
                  <br />
                  GSTIN: {COMPANY_INFO.gstin}
                  <br />
                  {COMPANY_INFO.email}
                </p>
              </div>
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Hash size={14} color="#3B82F6" />
                  <span style={{ fontSize: 13, color: '#888' }}>PO Number:</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{po.id}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Calendar size={14} color="#3B82F6" />
                  <span style={{ fontSize: 13, color: '#888' }}>PO Date:</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{formatDate(po.poDate)}</span>
                </div>
              </div>
            </div>

            {/* Right: Vendor Details */}
            <div>
              <p style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                Vendor
              </p>
              <div
                style={{
                  background: 'rgba(59,130,246,0.06)',
                  border: '1px solid rgba(59,130,246,0.15)',
                  borderRadius: 10,
                  padding: '14px 16px',
                }}
              >
                <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{po.vendor}</p>
                <p style={{ fontSize: 13, color: '#aaa', lineHeight: 1.6 }}>
                  {po.vendorAddress}
                  <br />
                  GSTIN: {po.vendorGST}
                  <br />
                  {po.vendorEmail}
                </p>
              </div>
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Calendar size={14} color="#3B82F6" />
                  <span style={{ fontSize: 13, color: '#888' }}>Invoice Date:</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{formatDate(po.invoiceDate)}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Calendar size={14} color="#22c55e" />
                  <span style={{ fontSize: 13, color: '#888' }}>Due Date:</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#22c55e' }}>{formatDate(po.dueDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
              Line Items
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Unit Price</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {po.items.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 500 }}>{item.name}</td>
                      <td style={{ textAlign: 'center', color: '#aaa' }}>{item.qty}</td>
                      <td style={{ textAlign: 'right', color: '#aaa' }}>{formatCurrency(item.unitPrice)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div
              style={{
                background: 'rgba(59,130,246,0.07)',
                border: '1px solid rgba(59,130,246,0.2)',
                borderRadius: 12,
                padding: '16px 24px',
                minWidth: 260,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#aaa', fontSize: 14 }}>Subtotal</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{formatCurrency(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ color: '#aaa', fontSize: 14 }}>GST (18%)</span>
                <span style={{ fontWeight: 600, fontSize: 14, color: '#f59e0b' }}>{formatCurrency(gst)}</span>
              </div>
              <div
                style={{
                  borderTop: '1px solid rgba(59,130,246,0.25)',
                  paddingTop: 10,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 15 }}>Grand Total</span>
                <span style={{ fontWeight: 800, fontSize: 16, color: '#3B82F6' }}>{formatCurrency(grandTotal)}</span>
              </div>
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

/* ──────────────────────── Main Component ───────────────────────── */

export default function PurchaseOrders() {
  const [activeTab, setActiveTab] = useState('po');
  const [selectedPO, setSelectedPO] = useState(null);
  const [invoices, setInvoices] = useState(MOCK_INVOICES);
  const [markingPaid, setMarkingPaid] = useState(null);

  const handleMarkPaid = async (inv) => {
    setMarkingPaid(inv.id);
    try {
      await invoicesAPI.markPaid?.(inv.id);
    } catch {
      // use mock fallback
    }
    setTimeout(() => {
      setInvoices((prev) =>
        prev.map((i) => (i.id === inv.id ? { ...i, status: 'Paid' } : i))
      );
      setMarkingPaid(null);
      toast(`Invoice ${inv.id} marked as Paid`, 'success');
    }, 600);
  };

  const tabs = [
    { key: 'po', label: 'Purchase Orders', icon: ShoppingCart },
    { key: 'inv', label: 'Invoices', icon: FileText },
  ];

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="gradient-text" style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>
            Purchase Order & Invoice
          </h1>
          <p style={{ color: '#888', fontSize: 14, margin: '4px 0 0' }}>
            Manage purchase orders and track invoice payments
          </p>
        </div>
      </div>

      {/* KPI Strip */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}
      >
        {[
          { label: 'Total POs', value: MOCK_POS.length, icon: Package, color: '#3B82F6' },
          {
            label: 'Approved POs',
            value: MOCK_POS.filter((p) => p.status === 'Approved').length,
            icon: CheckCircle,
            color: '#22c55e',
          },
          {
            label: 'Pending Invoices',
            value: invoices.filter((i) => i.status === 'Pending').length,
            icon: FileText,
            color: '#f59e0b',
          },
          {
            label: 'Total Value',
            value: formatCurrency(MOCK_POS.reduce((s, p) => s + p.amount, 0)),
            icon: IndianRupee,
            color: '#3B82F6',
          },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            className="kpi-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <kpi.icon size={18} color={kpi.color} />
              <span style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>{kpi.label}</span>
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: kpi.color, margin: 0 }}>{kpi.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="glass-card"
        style={{ padding: 0, overflow: 'hidden' }}
      >
        {/* Tab Bar */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid rgba(59,130,246,0.15)',
            background: 'rgba(59,130,246,0.04)',
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 28px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: activeTab === tab.key ? 700 : 500,
                color: activeTab === tab.key ? '#3B82F6' : '#888',
                borderBottom: activeTab === tab.key ? '2px solid #3B82F6' : '2px solid transparent',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
                marginBottom: -1,
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: '0 0 8px' }}>
          <AnimatePresence mode="wait">
            {activeTab === 'po' ? (
              <motion.div
                key="po"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.2 }}
              >
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>PO Number</th>
                        <th>Vendor</th>
                        <th>Amount</th>
                        <th>PO Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_POS.map((po) => (
                        <tr key={po.id}>
                          <td>
                            <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#3B82F6' }}>
                              {po.id}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 8,
                                  background: 'rgba(59,130,246,0.15)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                <Building2 size={15} color="#3B82F6" />
                              </div>
                              <span style={{ fontWeight: 500 }}>{po.vendor}</span>
                            </div>
                          </td>
                          <td style={{ fontWeight: 700, color: '#3B82F6' }}>{formatCurrency(po.amount)}</td>
                          <td style={{ color: '#aaa' }}>{formatDate(po.poDate)}</td>
                          <td>
                            <span className={poStatusBadge(po.status)}>{po.status}</span>
                          </td>
                          <td>
                            <button
                              className="btn btn-ghost"
                              onClick={() => setSelectedPO(po)}
                              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
                            >
                              <Eye size={14} /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="inv"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
              >
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>PO #</th>
                        <th>Vendor</th>
                        <th>Amount</th>
                        <th>Invoice Date</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr key={inv.id}>
                          <td>
                            <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#3B82F6' }}>
                              {inv.id}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#aaa' }}>
                              {inv.poNumber}
                            </span>
                          </td>
                          <td style={{ fontWeight: 500 }}>{inv.vendor}</td>
                          <td style={{ fontWeight: 700, color: '#3B82F6' }}>{formatCurrency(inv.amount)}</td>
                          <td style={{ color: '#aaa' }}>{formatDate(inv.invoiceDate)}</td>
                          <td
                            style={{
                              color: inv.status === 'Overdue' ? '#ef4444' : '#aaa',
                              fontWeight: inv.status === 'Overdue' ? 600 : 400,
                            }}
                          >
                            {formatDate(inv.dueDate)}
                          </td>
                          <td>
                            <span className={invStatusBadge(inv.status)}>{inv.status}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              {inv.status === 'Pending' && (
                                <button
                                  className="btn btn-success"
                                  onClick={() => handleMarkPaid(inv)}
                                  disabled={markingPaid === inv.id}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    fontSize: 12,
                                    padding: '6px 12px',
                                    opacity: markingPaid === inv.id ? 0.6 : 1,
                                  }}
                                >
                                  {markingPaid === inv.id ? (
                                    <span className="spinner" style={{ width: 14, height: 14 }} />
                                  ) : (
                                    <CheckCircle size={13} />
                                  )}
                                  Mark as Paid
                                </button>
                              )}
                              <button
                                className="btn btn-secondary"
                                onClick={async () => {
                                  try {
                                    const response = await invoicesAPI.getPDF(inv.id);
                                    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', `${inv.id}_Invoice.pdf`);
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                    toast('Invoice PDF Downloaded!', 'success');
                                  } catch (e) {
                                    toast('Failed to download invoice PDF', 'error');
                                  }
                                }}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '6px 10px' }}
                              >
                                <Download size={13} /> PDF
                              </button>
                              <button
                                className="btn btn-primary"
                                onClick={async () => {
                                  try {
                                    const poMatch = MOCK_POS.find(p => p.id === inv.poNumber);
                                    const emailToUse = poMatch?.vendorEmail || 'gururajasohal2@gmail.com';
                                    await invoicesAPI.sendEmail(inv.id, emailToUse);
                                    toast(`Invoice emailed to ${emailToUse}!`, 'success');
                                  } catch (e) {
                                    toast('Failed to send email', 'error');
                                  }
                                }}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '6px 10px' }}
                              >
                                <Mail size={13} /> Email
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* PO Detail Modal */}
      <AnimatePresence>
        {selectedPO && (
          <PODetailModal po={selectedPO} onClose={() => setSelectedPO(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

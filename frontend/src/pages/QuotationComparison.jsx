import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Trophy,
  Zap,
  Star,
  CheckCircle,
  ArrowRight,
  TrendingDown,
  Clock,
  Package,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { quotationsAPI, aiAPI } from '../services/api';
import { formatCurrency } from '../lib/utils';
import toast from 'react-hot-toast';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_RFQ = {
  id: 'RFQ-2024-0042',
  title: 'Office Furniture Procurement Q2',
  quotationCount: 3,
};

const MOCK_VENDORS = [
  { id: 'v1', name: 'InfraSupplies Ltd', rating: 4.7 },
  { id: 'v2', name: 'TechCore Ltd', rating: 4.5 },
  { id: 'v3', name: 'OfficeNeeds Co.', rating: 4.2 },
];

const MOCK_QUOTATIONS = [
  {
    vendorId: 'v1',
    totalPrice: 185400,
    deliveryDays: 14,
    items: {
      desk: 8500,
      chair: 3200,
      cabinet: 5800,
    },
  },
  {
    vendorId: 'v2',
    totalPrice: 207650,
    deliveryDays: 10,
    items: {
      desk: 9200,
      chair: 3800,
      cabinet: 6400,
    },
  },
  {
    vendorId: 'v3',
    totalPrice: 195900,
    deliveryDays: 18,
    items: {
      desk: 8900,
      chair: 3500,
      cabinet: 6100,
    },
  },
];

const MOCK_AI_RESULT = {
  summary:
    'Based on analysis, InfraSupplies Ltd offers the best value at ₹1,85,400 with competitive delivery timeline of 14 days. TechCore Ltd offers faster delivery but at 12% higher cost. Recommendation: Award to InfraSupplies Ltd.',
  bestValue: { vendorId: 'v1', reason: 'Lowest total cost at ₹1,85,400 — saves ₹22,250 vs next competitor' },
  fastestDelivery: { vendorId: 'v2', reason: 'Ships in 10 days, 4 days faster than InfraSupplies Ltd' },
  bestOverall: { vendorId: 'v1', reason: 'Best price-to-delivery ratio across all line items' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function rankValues(values) {
  // returns array of 'best' | 'mid' | 'worst' for lower-is-better metrics
  const sorted = [...values].sort((a, b) => a - b);
  return values.map((v) => {
    if (v === sorted[0]) return 'best';
    if (v === sorted[sorted.length - 1]) return 'worst';
    return 'mid';
  });
}

function CellHighlight({ rank, children }) {
  const styles = {
    best: {
      background: 'rgba(34, 197, 94, 0.15)',
      border: '1px solid rgba(34, 197, 94, 0.4)',
      color: '#22c55e',
    },
    mid: {
      background: 'rgba(234, 179, 8, 0.12)',
      border: '1px solid rgba(234, 179, 8, 0.35)',
      color: '#eab308',
    },
    worst: {
      background: 'rgba(239, 68, 68, 0.12)',
      border: '1px solid rgba(239, 68, 68, 0.35)',
      color: '#ef4444',
    },
  };

  return (
    <div
      style={{
        ...styles[rank],
        padding: '6px 12px',
        borderRadius: '8px',
        fontWeight: 600,
        fontSize: '0.9rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      {rank === 'best' && <TrendingDown size={13} />}
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function QuotationComparison() {
  const { rfqId } = useParams();
  const navigate = useNavigate();

  const [rfq] = useState(MOCK_RFQ);
  const [vendors] = useState(MOCK_VENDORS);
  const [quotations] = useState(MOCK_QUOTATIONS);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [selectingVendor, setSelectingVendor] = useState(null);

  // ── AI comparison on mount ──────────────────────────────────────────────
  useEffect(() => {
    const fetchAI = async () => {
      setAiLoading(true);
      try {
        const res = await aiAPI.compareQuotations(rfqId || rfq.id, quotations);
        setAiResult(res?.data || MOCK_AI_RESULT);
      } catch {
        // Fallback: simulate a short delay then use mock
        await new Promise((r) => setTimeout(r, 1800));
        setAiResult(MOCK_AI_RESULT);
      } finally {
        setAiLoading(false);
      }
    };
    fetchAI();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rfqId]);

  // ── Build row data ──────────────────────────────────────────────────────
  const totalPrices = vendors.map((v) => {
    const q = quotations.find((q) => q.vendorId === v.id);
    return q?.totalPrice ?? 0;
  });
  const deliveryDays = vendors.map((v) => {
    const q = quotations.find((q) => q.vendorId === v.id);
    return q?.deliveryDays ?? 0;
  });
  const deskPrices = vendors.map((v) => {
    const q = quotations.find((q) => q.vendorId === v.id);
    return q?.items?.desk ?? 0;
  });
  const chairPrices = vendors.map((v) => {
    const q = quotations.find((q) => q.vendorId === v.id);
    return q?.items?.chair ?? 0;
  });
  const cabinetPrices = vendors.map((v) => {
    const q = quotations.find((q) => q.vendorId === v.id);
    return q?.items?.cabinet ?? 0;
  });

  const totalRanks = rankValues(totalPrices);
  const deliveryRanks = rankValues(deliveryDays);
  const deskRanks = rankValues(deskPrices);
  const chairRanks = rankValues(chairPrices);
  const cabinetRanks = rankValues(cabinetPrices);

  const rows = [
    {
      label: 'Total Price',
      icon: <Package size={14} />,
      values: totalPrices,
      ranks: totalRanks,
      format: (v) => formatCurrency(v),
    },
    {
      label: 'Delivery Days',
      icon: <Clock size={14} />,
      values: deliveryDays,
      ranks: deliveryRanks,
      format: (v) => `${v} days`,
    },
    {
      label: 'Desk × 10',
      icon: null,
      values: deskPrices,
      ranks: deskRanks,
      format: (v) => formatCurrency(v),
      subItem: true,
    },
    {
      label: 'Chair × 20',
      icon: null,
      values: chairPrices,
      ranks: chairRanks,
      format: (v) => formatCurrency(v),
      subItem: true,
    },
    {
      label: 'Filing Cabinet × 5',
      icon: null,
      values: cabinetPrices,
      ranks: cabinetRanks,
      format: (v) => formatCurrency(v),
      subItem: true,
    },
  ];

  // ── Vendor selection ────────────────────────────────────────────────────
  const handleSelectVendor = async (vendor) => {
    setSelectingVendor(vendor.id);
    try {
      await quotationsAPI.createApproval?.({
        rfqId: rfqId || rfq.id,
        vendorId: vendor.id,
        vendorName: vendor.name,
      });
    } catch {
      // mock — continue
    }
    toast.success(`${vendor.name} selected! Sending to approval workflow…`);
    setTimeout(() => {
      navigate('/approvals');
    }, 1000);
  };

  // ── AI card meta ────────────────────────────────────────────────────────
  const aiCards = aiResult
    ? [
        {
          key: 'bestValue',
          icon: <Trophy size={18} />,
          label: 'Best Value',
          color: '#22c55e',
          bgColor: 'rgba(34,197,94,0.08)',
          borderColor: 'rgba(34,197,94,0.25)',
          vendorName: vendors.find((v) => v.id === aiResult.bestValue?.vendorId)?.name || 'InfraSupplies Ltd',
          reason: aiResult.bestValue?.reason,
        },
        {
          key: 'fastestDelivery',
          icon: <Zap size={18} />,
          label: 'Fastest Delivery',
          color: '#f59e0b',
          bgColor: 'rgba(245,158,11,0.08)',
          borderColor: 'rgba(245,158,11,0.25)',
          vendorName: vendors.find((v) => v.id === aiResult.fastestDelivery?.vendorId)?.name || 'TechCore Ltd',
          reason: aiResult.fastestDelivery?.reason,
        },
        {
          key: 'bestOverall',
          icon: <Star size={18} />,
          label: 'Best Overall',
          color: '#3B82F6',
          bgColor: 'rgba(59,130,246,0.08)',
          borderColor: 'rgba(59,130,246,0.25)',
          vendorName: vendors.find((v) => v.id === aiResult.bestOverall?.vendorId)?.name || 'InfraSupplies Ltd',
          reason: aiResult.bestOverall?.reason,
        },
      ]
    : [];

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="page-container">
      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Quotations Comparison
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                background: 'rgba(59,130,246,0.15)',
                color: '#3B82F6',
                padding: '2px 10px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              {rfqId || rfq.id}
            </span>
            Office Furniture Procurement Q2&nbsp;·&nbsp;
            <span style={{ color: '#22c55e', fontWeight: 600 }}>3 quotations received</span>
          </p>
        </div>
      </div>

      {/* ── Comparison Table ──────────────────────────────────────────────── */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: '1.5rem', overflowX: 'auto' }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: 0,
          }}
        >
          {/* thead */}
          <thead>
            <tr>
              <th
                style={{
                  padding: '16px 20px',
                  textAlign: 'left',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid var(--border)',
                  width: '200px',
                  background: 'rgba(59,130,246,0.04)',
                }}
              >
                Criteria
              </th>
              {vendors.map((vendor, idx) => (
                <th
                  key={vendor.id}
                  style={{
                    padding: '16px 20px',
                    textAlign: 'center',
                    borderBottom: '1px solid var(--border)',
                    background: idx === 0 ? 'rgba(34,197,94,0.04)' : 'rgba(59,130,246,0.04)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${idx === 0 ? '#22c55e' : idx === 1 ? '#3B82F6' : '#f59e0b'}, ${idx === 0 ? '#16a34a' : idx === 1 ? '#4f46e5' : '#d97706'})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '1rem',
                      }}
                    >
                      {vendor.name[0]}
                    </div>
                    <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.92rem' }}>{vendor.name}</span>
                    <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>★ {vendor.rating}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* tbody */}
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                style={{
                  background: row.subItem
                    ? 'rgba(0,0,0,0.1)'
                    : rowIdx % 2 === 0
                    ? 'transparent'
                    : 'rgba(255,255,255,0.01)',
                }}
              >
                {/* Criteria label */}
                <td
                  style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--border)',
                    color: row.subItem ? 'var(--text-muted)' : '#e2e8f0',
                    fontSize: row.subItem ? '0.85rem' : '0.9rem',
                    fontWeight: row.subItem ? 400 : 600,
                    paddingLeft: row.subItem ? '36px' : '20px',
                    display: 'table-cell',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {!row.subItem && row.icon}
                    {row.subItem && (
                      <ChevronRight size={12} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                    )}
                    {row.label}
                  </span>
                </td>

                {/* Vendor value cells */}
                {vendors.map((vendor, vIdx) => (
                  <td
                    key={vendor.id}
                    style={{
                      padding: '14px 20px',
                      textAlign: 'center',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <CellHighlight rank={row.ranks[vIdx]}>
                      {row.format(row.values[vIdx])}
                    </CellHighlight>
                  </td>
                ))}
              </tr>
            ))}

            {/* Action row */}
            <tr>
              <td
                style={{
                  padding: '20px 20px',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Action
              </td>
              {vendors.map((vendor) => (
                <td key={vendor.id} style={{ padding: '20px 20px', textAlign: 'center' }}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="btn btn-primary"
                    style={{
                      fontSize: '0.8rem',
                      padding: '8px 14px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                    }}
                    disabled={selectingVendor !== null}
                    onClick={() => handleSelectVendor(vendor)}
                  >
                    {selectingVendor === vendor.id ? (
                      <>
                        <span className="spinner" style={{ width: 14, height: 14 }} />
                        Selecting…
                      </>
                    ) : (
                      <>
                        <CheckCircle size={14} />
                        Select &amp; Proceed
                      </>
                    )}
                  </motion.button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </motion.div>

      {/* ── AI Recommendation Panel ───────────────────────────────────────── */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        style={{ padding: '0' }}
      >
        {/* Panel header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'linear-gradient(90deg, rgba(59,130,246,0.1), rgba(59,130,246,0.02))',
            borderRadius: '12px 12px 0 0',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={18} color="#fff" />
          </div>
          <div>
            <h2 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>
              AI Recommendation
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0 }}>
              Powered by VendorBridge AI · Analysed 5 criteria across 3 vendors
            </p>
          </div>
          <span
            style={{
              marginLeft: 'auto',
              background: 'rgba(59,130,246,0.15)',
              color: '#3B82F6',
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: '1px solid rgba(59,130,246,0.3)',
            }}
          >
            Beta
          </span>
        </div>

        {/* Panel body */}
        <div style={{ padding: '24px' }}>
          <AnimatePresence mode="wait">
            {aiLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '32px 0',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: 52,
                    height: 52,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50%',
                      border: '3px solid rgba(59,130,246,0.2)',
                    }}
                  />
                  <div
                    className="spinner"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      borderTopColor: '#3B82F6',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Sparkles size={20} color="#3B82F6" />
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: '4px' }}>
                    Analysing quotations…
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Comparing prices, delivery timelines, and vendor ratings
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Summary text */}
                <div
                  style={{
                    background: 'rgba(59,130,246,0.07)',
                    border: '1px solid rgba(59,130,246,0.2)',
                    borderRadius: '10px',
                    padding: '16px 20px',
                    marginBottom: '20px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                  }}
                >
                  <AlertCircle size={18} color="#3B82F6" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <p style={{ color: '#e2e8f0', lineHeight: 1.6, margin: 0, fontSize: '0.92rem' }}>
                    {aiResult?.summary || MOCK_AI_RESULT.summary}
                  </p>
                </div>

                {/* AI cards */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '16px',
                  }}
                >
                  {aiCards.map((card, idx) => (
                    <motion.div
                      key={card.key}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      style={{
                        background: card.bgColor,
                        border: `1px solid ${card.borderColor}`,
                        borderRadius: '12px',
                        padding: '18px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '10px',
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '8px',
                            background: `${card.color}22`,
                            border: `1px solid ${card.color}44`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: card.color,
                          }}
                        >
                          {card.icon}
                        </div>
                        <span
                          style={{
                            color: card.color,
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {card.label}
                        </span>
                      </div>
                      <p
                        style={{
                          color: '#e2e8f0',
                          fontWeight: 700,
                          fontSize: '1rem',
                          marginBottom: '6px',
                        }}
                      >
                        {card.vendorName}
                      </p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5, margin: 0 }}>
                        {card.reason}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Recommended CTA */}
                <div
                  style={{
                    marginTop: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '12px',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    AI recommends awarding to&nbsp;
                    <strong style={{ color: '#22c55e' }}>InfraSupplies Ltd</strong>
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="btn btn-success"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.85rem',
                    }}
                    disabled={selectingVendor !== null}
                    onClick={() => handleSelectVendor(vendors[0])}
                  >
                    {selectingVendor === 'v1' ? (
                      <>
                        <span className="spinner" style={{ width: 14, height: 14 }} />
                        Sending…
                      </>
                    ) : (
                      <>
                        <CheckCircle size={14} />
                        Accept AI Recommendation
                        <ArrowRight size={14} />
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

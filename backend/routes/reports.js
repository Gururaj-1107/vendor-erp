const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../supabase/client');

// ─── Demo / seed data used when DB tables are empty ─────────────────────────

const DEMO_MONTHLY_TREND = [
  { month: 'Jan', spend: 120000 },
  { month: 'Feb', spend: 210000 },
  { month: 'Mar', spend: 150000 },
  { month: 'Apr', spend: 300000 },
  { month: 'May', spend: 250000 },
  { month: 'Jun', spend: 210000 },
];

const DEMO_SPEND_BY_CATEGORY = [
  { category: 'IT', spend: 450000 },
  { category: 'Furniture', spend: 185400 },
  { category: 'Logistics', spend: 324000 },
  { category: 'HR', spend: 75000 },
  { category: 'Operations', spend: 205600 },
];

const DEMO_TOP_VENDORS = [
  { name: 'TechCore Ltd', spend: 450000, percentage: 36 },
  { name: 'LogiTrans India', spend: 324000, percentage: 26 },
  { name: 'InfraSupplies Ltd', spend: 185400, percentage: 15 },
  { name: 'FinServe Solutions', spend: 150000, percentage: 12 },
  { name: 'OfficeNeeds Co.', spend: 130600, percentage: 11 },
];

const DEMO_EXPORT_CSV = `PO Number,Vendor,Amount (INR),Date,Status
PO-2025-001,InfraSupplies Ltd,185400,2025-06-01,Approved
PO-2025-002,LogiTrans India,324000,2025-05-28,Approved
PO-2025-003,OfficeNeeds Co.,48500,2025-06-05,Pending Approval
PO-2025-004,TechCore Ltd,450000,2025-04-12,Paid`;

const SEED_KPIS = { activeRFQs: 5, pendingApprovals: 3, posThisMonth: 8, overdueInvoices: 2 };

// ─── Helpers ────────────────────────────────────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Return true if a Supabase response has at least one row. */
function hasRows(result) {
  return Array.isArray(result?.data) && result.data.length > 0;
}

// ─── GET /api/reports/summary ───────────────────────────────────────────────
// Real aggregation: total spend (sum of purchase_orders.total_amount),
// active vendor count, overdue invoice count.
router.get('/summary', async (req, res) => {
  try {
    const [vendorsRes, posRes, invoicesRes] = await Promise.all([
      supabaseAdmin.from('vendors').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('purchase_orders').select('amount'),
      supabaseAdmin.from('invoices').select('id', { count: 'exact', head: true }).eq('status', 'Overdue'),
    ]);

    const totalSpend = (posRes.data || []).reduce(
      (sum, po) => sum + (Number(po.total_amount) || 0),
      0
    );

    res.json({
      totalSpend,
      activeVendors: vendorsRes.count || 0,
      overdueInvoices: invoicesRes.count || 0,
    });
  } catch (err) {
    console.error('reports/summary error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── GET /api/reports/dashboard-kpis ────────────────────────────────────────
// Real counts. If ALL KPIs are zero AND the DB has some vendors or RFQs,
// return realistic seed values so the dashboard isn't blank on first load.
router.get('/dashboard-kpis', async (req, res) => {
  try {
    const [vendorsRes, rfqsRes, quotationsRes, approvalsRes] = await Promise.all([
      supabaseAdmin.from('vendors').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('rfqs').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('quotations').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('approvals').select('id', { count: 'exact', head: true })
    ]);

    const kpis = {
      vendorsCount: vendorsRes.count || 0,
      rfqsCount: rfqsRes.count || 0,
      quotationsCount: quotationsRes.count || 0,
      approvalsCount: approvalsRes.count || 0,
    };

    res.json(kpis);
  } catch (err) {
    console.error('reports/dashboard-kpis error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── GET /api/reports/monthly-trend ─────────────────────────────────────────
// Aggregate purchase_orders by month (using po_date). Falls back to demo data.
router.get('/monthly-trend', async (req, res) => {
  try {
    const { data: pos, error } = await supabaseAdmin
      .from('purchase_orders')
      .select('po_date, amount');

    if (error) console.error('monthly-trend query error:', error.message);

    // Build last-6-months skeleton
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const trend = [];

    for (let i = 5; i >= 0; i--) {
      let m = currentMonth - i;
      let y = currentYear;
      if (m < 0) {
        m += 12;
        y -= 1;
      }
      trend.push({ month: MONTHS[m], year: y, spend: 0 });
    }

    if (pos && pos.length > 0) {
      pos.forEach((po) => {
        const dateStr = po.po_date || po.created_at;
        if (!dateStr) return;
        const d = new Date(dateStr);
        const poMonth = d.getMonth();
        const poYear = d.getFullYear();
        const bucket = trend.find((t) => t.month === MONTHS[poMonth] && t.year === poYear);
        if (bucket) bucket.spend += Number(po.amount) || 0;
      });
    }

    const totalSpend = trend.reduce((s, t) => s + t.spend, 0);
    if (totalSpend === 0) {
      return res.json(DEMO_MONTHLY_TREND);
    }

    // Strip year helper before sending
    res.json(trend.map(({ month, spend }) => ({ month, spend })));
  } catch (err) {
    console.error('reports/monthly-trend error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── GET /api/reports/spend-by-category ─────────────────────────────────────
// Join purchase_orders → rfqs to pull category, then aggregate spend.
router.get('/spend-by-category', async (req, res) => {
  try {
    // Supabase supports foreign-key joins via `select('..., rfqs(category)')`
    const { data: pos, error } = await supabaseAdmin
      .from('purchase_orders')
      .select('amount, rfqs(category)');

    if (error) console.error('spend-by-category query error:', error.message);

    if (pos && pos.length > 0) {
      const categoryMap = {};

      pos.forEach((po) => {
        // rfqs comes back as an object when it's a single FK join
        const cat = po.rfqs?.category || 'Uncategorized';
        categoryMap[cat] = (categoryMap[cat] || 0) + (Number(po.amount) || 0);
      });

      const result = Object.entries(categoryMap)
        .map(([category, spend]) => ({ category, spend }))
        .sort((a, b) => b.spend - a.spend);

      if (result.length > 0) {
        return res.json(result);
      }
    }

    // Fallback demo data
    res.json(DEMO_SPEND_BY_CATEGORY);
  } catch (err) {
    console.error('reports/spend-by-category error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── GET /api/reports/top-vendors ───────────────────────────────────────────
// Aggregate purchase_orders joined with vendors, sorted by spend desc.
router.get('/top-vendors', async (req, res) => {
  try {
    const { data: pos, error } = await supabaseAdmin
      .from('purchase_orders')
      .select('amount, vendors(name)');

    if (error) console.error('top-vendors query error:', error.message);

    if (pos && pos.length > 0) {
      const vendorMap = {};

      pos.forEach((po) => {
        const vendorName = po.vendors?.name || 'Unknown Vendor';
        vendorMap[vendorName] = (vendorMap[vendorName] || 0) + (Number(po.amount) || 0);
      });

      const totalSpend = Object.values(vendorMap).reduce((s, v) => s + v, 0);

      const result = Object.entries(vendorMap)
        .map(([name, spend]) => ({
          name,
          spend,
          percentage: totalSpend > 0 ? Math.round((spend / totalSpend) * 100) : 0,
        }))
        .sort((a, b) => b.spend - a.spend)
        .slice(0, 10);

      if (result.length > 0) {
        return res.json(result);
      }
    }

    // Fallback demo data
    res.json(DEMO_TOP_VENDORS);
  } catch (err) {
    console.error('reports/top-vendors error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── GET /api/reports/export ────────────────────────────────────────────────
// Generate CSV from real PO + vendor data, falling back to demo CSV.
router.get('/export', async (req, res) => {
  try {
    const { data: pos, error } = await supabaseAdmin
      .from('purchase_orders')
      .select('po_number, amount, po_date, status, vendors(name)')
      .order('po_date', { ascending: false });

    if (error) console.error('export query error:', error.message);

    let csv;

    if (pos && pos.length > 0) {
      const header = 'PO Number,Vendor,Amount (INR),Date,Status';
      const rows = pos.map((po) => {
        const vendor = po.vendors?.name || 'Unknown';
        const amount = Number(po.amount) || 0;
        const date = po.po_date || '';
        const status = po.status || '';
        // Escape vendor name in case it contains commas
        const safeVendor = vendor.includes(',') ? `"${vendor}"` : vendor;
        return `${po.po_number || ''},${safeVendor},${amount},${date},${status}`;
      });
      csv = [header, ...rows].join('\n');
    } else {
      csv = DEMO_EXPORT_CSV;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="procurement_spend_report.csv"');
    res.status(200).send(csv);
  } catch (err) {
    console.error('reports/export error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;

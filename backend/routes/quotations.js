const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../supabase/client');

// ── helpers ──────────────────────────────────────────────────────────────────
const toSnakeCase = (obj) =>
  Object.keys(obj).reduce((acc, k) => {
    acc[k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)] = obj[k];
    return acc;
  }, {});

const toCamelCase = (obj) =>
  Object.keys(obj).reduce((acc, k) => {
    acc[k.replace(/_([a-z])/g, (m, letter) => letter.toUpperCase())] = obj[k];
    return acc;
  }, {});

// Columns that actually exist in the quotations table
const ALLOWED_COLUMNS = new Set([
  'id', 'rfq_id', 'vendor_id', 'delivery_days', 'tax_percent',
  'subtotal', 'gst_amount', 'note_terms', 'grand_total', 'status', 'submitted_at'
]);

/**
 * Strip every key that is NOT in the quotations table schema.
 * This removes vendor_name, rfq_title, items, and any other frontend-only fields.
 */
const stripToSchema = (payload) => {
  const clean = {};
  for (const key of Object.keys(payload)) {
    if (ALLOWED_COLUMNS.has(key) && payload[key] !== undefined) {
      clean[key] = payload[key];
    }
  }
  return clean;
};

// ── mock data (realistic Indian B2B procurement) ─────────────────────────────
const mockQuotations = [
  {
    id: '1', rfq_id: '1', vendor_id: '2',
    grand_total: 185400, delivery_days: 14, tax_percent: 18,
    subtotal: 157119, gst_amount: 28281,
    note_terms: 'Payment within 30 days of invoice. Delivery to Pune warehouse.',
    status: 'submitted', submitted_at: '2025-06-10T09:30:00Z'
  },
  {
    id: '2', rfq_id: '1', vendor_id: '1',
    grand_total: 207650, delivery_days: 10, tax_percent: 18,
    subtotal: 175975, gst_amount: 31675,
    note_terms: '50% advance, balance on delivery. Free installation included.',
    status: 'submitted', submitted_at: '2025-06-11T11:15:00Z'
  },
  {
    id: '3', rfq_id: '1', vendor_id: '3',
    grand_total: 196200, delivery_days: 18, tax_percent: 18,
    subtotal: 166271, gst_amount: 29929,
    note_terms: 'Net 45 days. GST as applicable under SAC 9954.',
    status: 'submitted', submitted_at: '2025-06-12T14:45:00Z'
  },
  {
    id: '4', rfq_id: '2', vendor_id: '1',
    grand_total: 485000, delivery_days: 21, tax_percent: 18,
    subtotal: 411017, gst_amount: 73983,
    note_terms: 'Installation & 1-year AMC included. Freight extra for remote sites.',
    status: 'submitted', submitted_at: '2025-06-08T10:00:00Z'
  },
  {
    id: '5', rfq_id: '2', vendor_id: '5',
    grand_total: 512000, delivery_days: 15, tax_percent: 18,
    subtotal: 433898, gst_amount: 78102,
    note_terms: '3-year warranty. On-site support within 4 hours (metro cities).',
    status: 'submitted', submitted_at: '2025-06-09T16:20:00Z'
  },
  {
    id: '6', rfq_id: '3', vendor_id: '4',
    grand_total: 324000, delivery_days: 7, tax_percent: 18,
    subtotal: 274576, gst_amount: 49424,
    note_terms: 'Rate valid for 60 days. Diesel surcharge applicable above ₹95/L.',
    status: 'selected', submitted_at: '2025-05-22T08:30:00Z'
  },
  {
    id: '7', rfq_id: '3', vendor_id: '6',
    grand_total: 348500, delivery_days: 10, tax_percent: 18,
    subtotal: 295339, gst_amount: 53161,
    note_terms: 'Includes warehousing at Bhiwandi. E-way bill compliance guaranteed.',
    status: 'submitted', submitted_at: '2025-05-23T12:10:00Z'
  },
];

// ── GET /api/quotations ──────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('quotations')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('GET Error in quotations.js:', error);
      return res.status(500).json({ error: error.message });
    }

    // Fall back to mock data when the table is empty
    if (!data || data.length === 0) {
      return res.json(mockQuotations.map(toCamelCase));
    }

    res.json(data.map(toCamelCase));
  } catch (err) {
    console.error('Server Error in quotations.js:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/quotations/rfq/:rfqId ──────────────────────────────────────────
router.get('/rfq/:rfqId', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('quotations')
      .select('*')
      .eq('rfq_id', req.params.rfqId)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('GET /rfq/:rfqId Error in quotations.js:', error);
      // Fall back to filtered mock data on error
      return res.json(
        mockQuotations
          .filter(q => q.rfq_id === req.params.rfqId)
          .map(toCamelCase)
      );
    }

    // Fall back to mock if no rows returned
    if (!data || data.length === 0) {
      return res.json(
        mockQuotations
          .filter(q => q.rfq_id === req.params.rfqId)
          .map(toCamelCase)
      );
    }

    res.json(data.map(toCamelCase));
  } catch (err) {
    console.error('Server Error in quotations.js:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/quotations/compare/:rfqId ───────────────────────────────────────
router.get('/compare/:rfqId', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('quotations')
      .select('*')
      .eq('rfq_id', req.params.rfqId)
      .order('grand_total', { ascending: true });

    if (error) {
      console.error('GET /compare/:rfqId Error in quotations.js:', error);
      return res.json(
        mockQuotations
          .filter(q => q.rfq_id === req.params.rfqId)
          .map(toCamelCase)
      );
    }

    if (!data || data.length === 0) {
      return res.json(
        mockQuotations
          .filter(q => q.rfq_id === req.params.rfqId)
          .map(toCamelCase)
      );
    }

    res.json(data.map(toCamelCase));
  } catch (err) {
    console.error('Server Error in quotations.js:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/quotations/:id ──────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('quotations')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      // Fall back to mock
      const mock = mockQuotations.find(q => q.id === req.params.id) || mockQuotations[0];
      return res.json(toCamelCase(mock));
    }

    res.json(toCamelCase(data));
  } catch (err) {
    console.error('Server Error in quotations.js:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/quotations ─────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    // Convert incoming camelCase body to snake_case
    const raw = toSnakeCase(req.body);

    // Strip to schema-only columns (removes vendor_name, rfq_title, items, etc.)
    const payload = stripToSchema(raw);

    // Defaults — delivery_days is NOT NULL in the DB
    if (!payload.delivery_days && payload.delivery_days !== 0) {
      payload.delivery_days = 14;
    }
    payload.status = payload.status || 'submitted';
    payload.submitted_at = payload.submitted_at || new Date().toISOString();

    console.log('Inserting quotation payload:', payload);

    const { data, error } = await supabaseAdmin
      .from('quotations')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('POST Error in quotations.js:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(toCamelCase(data));
  } catch (err) {
    console.error('Server Error in quotations.js:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/quotations/:id/select ──────────────────────────────────────────
router.post('/:id/select', async (req, res) => {
  try {
    // 1. Update the quotation status to 'selected'
    const { data: quote, error: quoteErr } = await supabaseAdmin
      .from('quotations')
      .update({ status: 'selected' })
      .eq('id', req.params.id)
      .select()
      .single();

    if (quoteErr) {
      console.error('POST /:id/select quotation update error:', quoteErr);
      return res.status(500).json({ error: quoteErr.message });
    }

    // 2. Create an approval entry
    const approvalPayload = {
      rfq_id: quote.rfq_id,
      vendor_id: quote.vendor_id,
      amount: quote.grand_total,
      status: 'pending',
      stage: 1,
      submitted_by: req.body.submittedBy || req.body.submitted_by || 'Procurement Officer',
      remarks: req.body.remarks || '',
      created_at: new Date().toISOString(),
    };

    const { data: approval, error: approvalErr } = await supabaseAdmin
      .from('approvals')
      .insert(approvalPayload)
      .select()
      .single();

    if (approvalErr) {
      console.error('POST /:id/select approval insert error:', approvalErr);
      // Quotation was updated but approval failed — return partial success
      return res.status(207).json({
        success: true,
        quote: toCamelCase(quote),
        approval: null,
        warning: 'Quotation selected but approval creation failed: ' + approvalErr.message
      });
    }

    res.json({
      success: true,
      quote: toCamelCase(quote),
      approval: toCamelCase(approval)
    });
  } catch (err) {
    console.error('Server Error in quotations.js:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../supabase/client');

const toSnakeCase = (obj) => Object.keys(obj).reduce((acc, k) => { acc[k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)] = obj[k]; return acc; }, {});
const toCamelCase = (obj) => Object.keys(obj).reduce((acc, k) => { acc[k.replace(/_([a-z])/g, (m, letter) => letter.toUpperCase())] = obj[k]; return acc; }, {});

const mockVendors = [
  { id: '1', name: 'TechCore Ltd', category: 'IT', gst_no: '27AABCS1429B1Z0', contact_no: '8583896838', email: 'info@techcore.com', status: 'active', created_at: '2025-01-15' },
  { id: '2', name: 'InfraSupplies Ltd', category: 'Operations', gst_no: '27AABCX5621K1Z5', contact_no: '9876543210', email: 'contact@infra.com', status: 'active', created_at: '2025-02-01' },
  { id: '3', name: 'OfficeNeeds Co.', category: 'Furniture', gst_no: '27AABCO1234B1Z1', contact_no: '7701234567', email: 'sales@officeneeds.com', status: 'active', created_at: '2025-02-10' },
  { id: '4', name: 'LogiTrans India', category: 'Logistics', gst_no: '27AABCL9876F1Z3', contact_no: '9988776655', email: 'ops@logitrans.in', status: 'pending', created_at: '2025-03-05' },
  { id: '5', name: 'FinServe Solutions', category: 'Finance', gst_no: '27AABCF5432J1Z8', contact_no: '8822334455', email: 'hi@finserve.com', status: 'active', created_at: '2025-03-15' },
  { id: '6', name: 'HR Bridge Pvt', category: 'HR', gst_no: '27AABCH1111A1Z2', contact_no: '7711223344', email: 'team@hrbridge.com', status: 'blocked', created_at: '2025-04-01' },
];

// GET /api/vendors
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    const { data, error } = await supabaseAdmin.from('vendors').select('*').order('created_at', { ascending: false });
    
    if (error) {
      console.error("Supabase GET error:", error);
      // Fallback to mock
      let result = mockVendors;
      if (status && status !== 'all') result = result.filter(v => v.status === status);
      if (search) {
        const q = search.toLowerCase();
        result = result.filter(v => v.name?.toLowerCase().includes(q) || v.gst_no?.toLowerCase().includes(q) || v.category?.toLowerCase().includes(q));
      }
      return res.json(result.map(v => ({ ...v, gstNo: v.gst_no, contactNo: v.contact_no, registeredOn: v.created_at })));
    }

    // Use real data, fall back to mock if empty
    let result = data.length > 0 ? data : mockVendors;
    
    if (status && status !== 'all') {
      result = result.filter(v => v.status === status);
    }

    const mappedData = result.map(v => ({
      ...v,
      gstNo: v.gst_no,
      contactNo: v.contact_no,
      registeredOn: v.created_at
    }));

    if (search) {
      const q = search.toLowerCase();
      return res.json(mappedData.filter(v =>
        v.name?.toLowerCase().includes(q) ||
        v.gstNo?.toLowerCase().includes(q) ||
        v.category?.toLowerCase().includes(q)
      ));
    }
    res.json(mappedData);
  } catch (err) { 
    console.error("Server error:", err);
    res.json(mockVendors.map(v => ({ ...v, gstNo: v.gst_no, contactNo: v.contact_no, registeredOn: v.created_at })));
  }
});

// GET /api/vendors/:id
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('vendors').select('*').eq('id', req.params.id).single();
    if (error) return res.json(mockVendors.find(v => v.id === req.params.id) || mockVendors[0]);
    res.json(data);
  } catch (err) { console.error("Server Error in vendors.js:", err); res.status(500).json({error: err.message}); }
});

// POST /api/vendors
router.post('/', async (req, res) => {
  try {
    const payload = {
      name: req.body.name,
      category: req.body.category,
      gst_no: req.body.gstNo || req.body.gst_no,
      contact_no: req.body.contactNo || req.body.contact_no,
      email: req.body.email,
      status: req.body.status || 'active'
    };
    // Remove undefined keys
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
    
    const { data, error } = await supabaseAdmin.from('vendors').insert(payload).select().single();
    if (error) {
      console.error("Supabase insert error in vendors:", error);
      if (error.code === '23505') {
        return res.status(400).json({ error: 'A vendor with this GST Number already exists.' });
      }
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json(data);
  } catch (err) { 
    console.error("Server error:", err);
    res.status(500).json({ error: err.message }); 
  }
});

// PUT /api/vendors/:id
router.put('/:id', async (req, res) => {
  try {
    const payload = {
      name: req.body.name,
      category: req.body.category,
      gst_no: req.body.gstNo || req.body.gst_no,
      contact_no: req.body.contactNo || req.body.contact_no,
      email: req.body.email,
      status: req.body.status
    };
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
    
    const { data, error } = await supabaseAdmin.from('vendors').update(payload).eq('id', req.params.id).select().single();
    if (error) { 
      console.error("PUT Error in vendors.js:", error); 
      if (error.code === '23505') {
        return res.status(400).json({ error: 'A vendor with this GST Number already exists.' });
      }
      return res.status(500).json({error: error.message}); 
    }
    res.json(data);
  } catch (err) { console.error("Server Error in vendors.js:", err); res.status(500).json({error: err.message}); }
});

// PATCH /api/vendors/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('vendors').update({ status: req.body.status }).eq('id', req.params.id).select().single();
    if (error) { console.error("PATCH Error in vendors.js:", error); return res.status(500).json({error: error.message}); }
    res.json(data);
  } catch (err) { console.error("Server Error in vendors.js:", err); res.status(500).json({error: err.message}); }
});

// DELETE /api/vendors/:id
router.delete('/:id', async (req, res) => {
  try {
    await supabaseAdmin.from('vendors').delete().eq('id', req.params.id);
    res.json({ success: true });
  } catch (err) { console.error("Server Error in vendors.js:", err); res.status(500).json({error: err.message}); }
});

module.exports = router;

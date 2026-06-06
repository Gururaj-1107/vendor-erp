const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../supabase/client');

const mockApprovals = [
  {
    id: 'APR-001',
    rfq_id: 'RFQ-001',
    vendor_id: 'VND-001',
    stage: 2,
    status: 'pending',
    remarks: 'Awaiting L2 approval',
    submitted_by: 'Rahul Sharma',
    approved_at: null,
    created_at: '2026-06-01T10:00:00Z',
    rfq_title: 'Office Supplies Q3 2026',
    vendor_name: 'Acme Supplies Pvt Ltd'
  }
];

async function enrichApproval(approval) {
  const enriched = { ...approval, rfq_title: null, vendor_name: null };

  if (approval.rfq_id) {
    const { data: rfq } = await supabaseAdmin.from('rfqs').select('title').eq('id', approval.rfq_id).single();
    if (rfq) enriched.rfq_title = rfq.title;
  }
  if (approval.vendor_id) {
    const { data: vendor } = await supabaseAdmin.from('vendors').select('name').eq('id', approval.vendor_id).single();
    if (vendor) enriched.vendor_name = vendor.name;
  }
  return enriched;
}

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('approvals').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) return res.json(mockApprovals);
    const enriched = await Promise.all(data.map(enrichApproval));
    return res.json(enriched);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin.from('approvals').select('*').eq('id', id).single();
    if (error || !data) {
      const mock = mockApprovals.find((a) => a.id === id);
      if (mock) return res.json(mock);
      return res.status(404).json({ error: 'Approval not found' });
    }
    const enriched = await enrichApproval(data);
    return res.json(enriched);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body || {};
    const updatePayload = { status: 'approved', approved_at: new Date().toISOString(), stage: 3 };
    if (remarks) updatePayload.remarks = remarks;

    const { data, error } = await supabaseAdmin.from('approvals').update(updatePayload).eq('id', id).select('*').single();
    if (error || !data) return res.status(500).json({ error: 'Failed to approve' });

    // Try to create a PO if stage 3
    try {
      // Need vendor_name for PO!
      const { data: vendor } = await supabaseAdmin.from('vendors').select('name').eq('id', data.vendor_id).single();
      const poPayload = {
        rfq_id: data.rfq_id,
        vendor_id: data.vendor_id,
        vendor_name: vendor ? vendor.name : 'Unknown',
        amount: 0, // Fallback since approval doesn't have amount
        status: 'created',
        po_date: new Date().toISOString().split('T')[0]
      };
      
      const year = new Date().getFullYear();
      const prefix = `PO-${year}-`;
      const { data: poData } = await supabaseAdmin.from('purchase_orders').select('po_number').like('po_number', `${prefix}%`).order('po_number', { ascending: false }).limit(1);
      let nextNum = 1;
      if (poData && poData.length > 0) {
        const lastNum = parseInt(poData[0].po_number.replace(prefix, ''), 10);
        if (!isNaN(lastNum)) nextNum = lastNum + 1;
      }
      poPayload.po_number = `${prefix}${String(nextNum).padStart(3, '0')}`;

      await supabaseAdmin.from('purchase_orders').insert(poPayload);
    } catch (poErr) {
      console.warn('Purchase order creation failed:', poErr.message);
    }

    const enriched = await enrichApproval(data);
    return res.json({ message: 'Approval approved successfully', approval: enriched });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body || {};
    const updatePayload = { status: 'rejected', approved_at: new Date().toISOString() };
    if (remarks) updatePayload.remarks = remarks;

    const { data, error } = await supabaseAdmin.from('approvals').update(updatePayload).eq('id', id).select('*').single();
    if (error || !data) return res.status(500).json({ error: 'Failed to reject' });

    const enriched = await enrichApproval(data);
    return res.json({ message: 'Approval rejected successfully', approval: enriched });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

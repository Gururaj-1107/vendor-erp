const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../supabase/client');

const mockActivities = [
  { id: '1', description: 'RFQ-2025-001 created', user: 'Rahul Sharma', timestamp: '2025-06-06T10:00:00Z', type: 'RFQ' },
  { id: '2', description: 'Quotation submitted by TechCore Ltd for RFQ-2025-001', user: 'TechCore Representative', timestamp: '2025-06-06T10:15:00Z', type: 'RFQ' },
  { id: '3', description: 'Quotation submitted by InfraSupplies Ltd for RFQ-2025-001', user: 'InfraSupplies Representative', timestamp: '2025-06-06T10:20:00Z', type: 'RFQ' },
  { id: '4', description: 'Quotation comparison initiated for RFQ-2025-001', user: 'Rahul Sharma', timestamp: '2025-06-06T10:25:00Z', type: 'RFQ' },
  { id: '5', description: 'AI comparison recommendation generated for RFQ-2025-001', user: 'AI Assistant', timestamp: '2025-06-06T10:25:05Z', type: 'RFQ' },
  { id: '6', description: 'Approval request generated for RFQ-2025-001 to award to InfraSupplies Ltd', user: 'Rahul Sharma', timestamp: '2025-06-06T10:30:00Z', type: 'Approvals' },
  { id: '7', description: 'L1 approval completed for RFQ-2025-001', user: 'Priya Mehta', timestamp: '2025-06-06T10:45:00Z', type: 'Approvals' },
  { id: '8', description: 'L2 approval completed for RFQ-2025-001', user: 'Director Vikram Malhotra', timestamp: '2025-06-06T11:00:00Z', type: 'Approvals' },
  { id: '9', description: 'Purchase Order PO-2025-001 automatically generated', user: 'System', timestamp: '2025-06-06T11:05:00Z', type: 'Invoices' },
  { id: '10', description: 'Invoice INV-2025-001 received from InfraSupplies Ltd', user: 'Vendor Portal', timestamp: '2025-06-06T11:15:00Z', type: 'Invoices' },
  { id: '11', description: 'New vendor registration for LogiTrans India', user: 'LogiTrans Ops', timestamp: '2025-06-05T09:00:00Z', type: 'Vendors' },
  { id: '12', description: 'Vendor LogiTrans India status updated to pending verification', user: 'Admin', timestamp: '2025-06-05T09:30:00Z', type: 'Vendors' },
  { id: '13', description: 'Vendor TechCore Ltd status changed to Active', user: 'Admin', timestamp: '2025-06-04T14:00:00Z', type: 'Vendors' },
  { id: '14', description: 'Invoice INV-2025-004 marked as overdue', user: 'System', timestamp: '2025-06-03T00:00:00Z', type: 'Invoices' },
  { id: '15', description: 'Spend report generated for Q1 2025', user: 'Priya Mehta', timestamp: '2025-06-02T16:30:00Z', type: 'Approvals' }
];

// GET /api/activity
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    let { data, error } = await supabaseAdmin.from('activity_log').select('*').order('timestamp', { ascending: false });
    if (error) {
      let filtered = mockActivities;
      if (type && type !== 'all') {
        filtered = mockActivities.filter(act => act.type.toLowerCase() === type.toLowerCase());
      }
      return res.json(filtered);
    }
    
    let result = data.length ? data : mockActivities;
    if (type && type !== 'all') {
      result = result.filter(act => act.type.toLowerCase() === type.toLowerCase());
    }
    res.json(result);
  } catch {
    let filtered = mockActivities;
    if (type && type !== 'all') {
      filtered = mockActivities.filter(act => act.type.toLowerCase() === type.toLowerCase());
    }
    res.json(filtered);
  }
});

module.exports = router;

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
  console.log('🌱 Seeding VendorBridge database...\n');

  // 1. Check existing vendors
  const { data: existingVendors } = await sb.from('vendors').select('id, name');
  console.log(`Existing vendors: ${existingVendors?.length || 0}`);

  // Add more vendors if we have fewer than 6
  const vendorsToAdd = [
    { name: 'LogiTrans India', category: 'Logistics', gst_no: '27AABCL9876F1Z3', contact_no: '9988776655', email: 'ops@logitrans.in', status: 'active' },
    { name: 'FinServe Solutions', category: 'Finance', gst_no: '27AABCF5432J1Z8', contact_no: '8822334455', email: 'hi@finserve.com', status: 'active' },
    { name: 'HR Bridge Pvt', category: 'HR', gst_no: '27AABCH1111A1Z2', contact_no: '7711223344', email: 'team@hrbridge.com', status: 'pending' },
  ];

  const existingNames = existingVendors?.map(v => v.name) || [];
  const newVendors = vendorsToAdd.filter(v => !existingNames.includes(v.name));
  
  if (newVendors.length > 0) {
    const { data: insertedVendors, error: vErr } = await sb.from('vendors').insert(newVendors).select();
    if (vErr) console.error('Vendor insert error:', vErr.message);
    else console.log(`✅ Added ${insertedVendors.length} new vendors`);
  } else {
    console.log('✅ Vendors already seeded');
  }

  // Re-fetch all vendors for reference
  const { data: allVendors } = await sb.from('vendors').select('id, name');
  const vendorMap = {};
  allVendors.forEach(v => vendorMap[v.name] = v.id);
  console.log('Vendor map:', Object.keys(vendorMap).join(', '));

  // 2. Add RFQs
  const { data: existingRFQs } = await sb.from('rfqs').select('id, rfq_number, title');
  console.log(`\nExisting RFQs: ${existingRFQs?.length || 0}`);

  const rfqsToAdd = [
    { rfq_number: 'RFQ-2026-001', title: 'Office Furniture Procurement Q2', category: 'Furniture', deadline: '2026-07-15', description: 'Procurement of office furniture including desks, chairs, and filing cabinets for the new wing expansion.', status: 'active', created_by: null },
    { rfq_number: 'RFQ-2026-002', title: 'IT Infrastructure Upgrade', category: 'IT', deadline: '2026-07-30', description: 'Servers, networking switches, and UPS systems for data center modernization.', status: 'active', created_by: null },
    { rfq_number: 'RFQ-2026-003', title: 'Logistics Partner Contract', category: 'Logistics', deadline: '2026-06-30', description: 'Annual logistics and warehousing services contract renewal.', status: 'awarded', created_by: null },
    { rfq_number: 'RFQ-2026-004', title: 'HR Software Licensing', category: 'HR', deadline: '2026-08-01', description: 'HRMS software licenses for employee management and payroll.', status: 'draft', created_by: null },
    { rfq_number: 'RFQ-2026-005', title: 'Office Supplies Q3', category: 'Operations', deadline: '2026-09-01', description: 'Stationery, printer paper, ink cartridges, and general office supplies.', status: 'active', created_by: null },
  ];

  const existingRFQNums = existingRFQs?.map(r => r.rfq_number) || [];
  const newRFQs = rfqsToAdd.filter(r => !existingRFQNums.includes(r.rfq_number));
  
  let rfqMap = {};
  existingRFQs?.forEach(r => rfqMap[r.rfq_number] = r.id);

  if (newRFQs.length > 0) {
    const { data: insertedRFQs, error: rErr } = await sb.from('rfqs').insert(newRFQs).select();
    if (rErr) console.error('RFQ insert error:', rErr.message);
    else {
      console.log(`✅ Added ${insertedRFQs.length} new RFQs`);
      insertedRFQs.forEach(r => rfqMap[r.rfq_number] = r.id);
    }
  } else {
    console.log('✅ RFQs already seeded');
  }

  // 3. Add Quotations
  const { data: existingQuotes } = await sb.from('quotations').select('id');
  console.log(`\nExisting quotations: ${existingQuotes?.length || 0}`);

  if (!existingQuotes || existingQuotes.length === 0) {
    const rfq1 = rfqMap['RFQ-2026-001'];
    const rfq2 = rfqMap['RFQ-2026-002'];

    if (rfq1 && rfq2) {
      const quotations = [
        { rfq_id: rfq1, vendor_id: vendorMap['InfraSupplies Ltd'], delivery_days: 14, tax_percent: 18, subtotal: 157119, gst_amount: 28281, grand_total: 185400, note_terms: 'Payment within 30 days. Free delivery included.', status: 'submitted' },
        { rfq_id: rfq1, vendor_id: vendorMap['TechCore Ltd'], delivery_days: 10, tax_percent: 18, subtotal: 175975, gst_amount: 31675, grand_total: 207650, note_terms: 'Advance 50% required. Installation included.', status: 'submitted' },
        { rfq_id: rfq1, vendor_id: vendorMap['OfficeNeeds Co.'], delivery_days: 18, tax_percent: 18, subtotal: 166271, gst_amount: 29929, grand_total: 196200, note_terms: 'Net 45 days. 1 year warranty on all items.', status: 'submitted' },
        { rfq_id: rfq2, vendor_id: vendorMap['TechCore Ltd'], delivery_days: 21, tax_percent: 18, subtotal: 411017, gst_amount: 73983, grand_total: 485000, note_terms: 'Installation and 3-year AMC included.', status: 'submitted' },
        { rfq_id: rfq2, vendor_id: vendorMap['FinServe Solutions'], delivery_days: 15, tax_percent: 18, subtotal: 433898, gst_amount: 78102, grand_total: 512000, note_terms: '3-year warranty. 24/7 support.', status: 'submitted' },
      ].filter(q => q.vendor_id); // Only add if vendor exists

      if (quotations.length > 0) {
        const { data: insertedQuotes, error: qErr } = await sb.from('quotations').insert(quotations).select();
        if (qErr) console.error('Quotation insert error:', qErr.message);
        else console.log(`✅ Added ${insertedQuotes.length} quotations`);
      }
    } else {
      console.log('⚠️ Cannot seed quotations: RFQ IDs not found');
    }
  } else {
    console.log('✅ Quotations already seeded');
  }

  // 4. Add Approvals
  const { data: existingApprovals } = await sb.from('approvals').select('id');
  console.log(`\nExisting approvals: ${existingApprovals?.length || 0}`);

  if (!existingApprovals || existingApprovals.length === 0) {
    const rfq1 = rfqMap['RFQ-2026-001'];
    const rfq2 = rfqMap['RFQ-2026-002'];
    const rfq3 = rfqMap['RFQ-2026-003'];

    const approvals = [
      { rfq_id: rfq1, vendor_id: vendorMap['InfraSupplies Ltd'], stage: 2, submitted_by: null, status: 'pending', remarks: '' },
      { rfq_id: rfq3, vendor_id: vendorMap['LogiTrans India'], stage: 3, submitted_by: null, status: 'approved', remarks: 'Good vendor track record', approved_at: '2026-05-28T00:00:00Z' },
      { rfq_id: rfq2, vendor_id: vendorMap['TechCore Ltd'], stage: 1, submitted_by: null, status: 'pending', remarks: '' },
    ].filter(a => a.rfq_id && a.vendor_id);

    if (approvals.length > 0) {
      const { data: insertedApprovals, error: aErr } = await sb.from('approvals').insert(approvals).select();
      if (aErr) console.error('Approval insert error:', aErr.message);
      else console.log(`✅ Added ${insertedApprovals.length} approvals`);
    }
  } else {
    console.log('✅ Approvals already seeded');
  }

  // 5. Add Purchase Orders
  const { data: existingPOs } = await sb.from('purchase_orders').select('id');
  console.log(`\nExisting purchase orders: ${existingPOs?.length || 0}`);

  if (!existingPOs || existingPOs.length === 0) {
    const rfq1 = rfqMap['RFQ-2026-001'];
    const rfq3 = rfqMap['RFQ-2026-003'];

    const pos = [
      { po_number: 'PO-2026-001', rfq_id: rfq1, vendor_id: vendorMap['InfraSupplies Ltd'], vendor_name: 'InfraSupplies Ltd', amount: 185400, po_date: '2026-06-01', status: 'Approved', billing_company: 'VendorBridge Corp', billing_address: 'Tech Park, Suite 400, Mumbai, India', gst_percent: 18, subtotal: 157119, gst_amount: 28281, grand_total: 185400 },
      { po_number: 'PO-2026-002', rfq_id: rfq3, vendor_id: vendorMap['LogiTrans India'], vendor_name: 'LogiTrans India', amount: 324000, po_date: '2026-05-28', status: 'Approved', billing_company: 'VendorBridge Corp', billing_address: 'Tech Park, Suite 400, Mumbai, India', gst_percent: 18, subtotal: 274576, gst_amount: 49424, grand_total: 324000 },
      { po_number: 'PO-2026-003', rfq_id: rfq1, vendor_id: vendorMap['OfficeNeeds Co.'], vendor_name: 'OfficeNeeds Co.', amount: 48500, po_date: '2026-06-05', status: 'Pending Approval', billing_company: 'VendorBridge Corp', billing_address: 'Tech Park, Suite 400, Mumbai, India', gst_percent: 18, subtotal: 41102, gst_amount: 7398, grand_total: 48500 },
    ].filter(p => p.vendor_id);

    if (pos.length > 0) {
      const { data: insertedPOs, error: pErr } = await sb.from('purchase_orders').insert(pos).select();
      if (pErr) console.error('PO insert error:', pErr.message);
      else console.log(`✅ Added ${insertedPOs.length} purchase orders`);
    }
  } else {
    console.log('✅ Purchase orders already seeded');
  }

  // 6. Add Invoices
  const { data: existingInvoices } = await sb.from('invoices').select('id');
  console.log(`\nExisting invoices: ${existingInvoices?.length || 0}`);

  if (!existingInvoices || existingInvoices.length === 0) {
    const invoices = [
      { invoice_number: 'INV-2026-001', po_number: 'PO-2026-001', vendor_name: 'InfraSupplies Ltd', amount: 185400, invoice_date: '2026-06-02', due_date: '2026-07-02', status: 'Pending' },
      { invoice_number: 'INV-2026-002', po_number: 'PO-2026-002', vendor_name: 'LogiTrans India', amount: 324000, invoice_date: '2026-05-30', due_date: '2026-06-30', status: 'Paid' },
      { invoice_number: 'INV-2026-003', po_number: 'PO-2026-003', vendor_name: 'OfficeNeeds Co.', amount: 48500, invoice_date: '2026-06-06', due_date: '2026-07-06', status: 'Pending' },
      { invoice_number: 'INV-2026-004', po_number: 'PO-2026-001', vendor_name: 'InfraSupplies Ltd', amount: 15000, invoice_date: '2026-04-10', due_date: '2026-05-10', status: 'Overdue' },
    ];

    if (invoices.length > 0) {
      const { data: insertedInvoices, error: iErr } = await sb.from('invoices').insert(invoices).select();
      if (iErr) console.error('Invoice insert error:', iErr.message);
      else console.log(`✅ Added ${insertedInvoices.length} invoices`);
    }
  } else {
    console.log('✅ Invoices already seeded');
  }

  // 7. Add Activity Log entries
  const { data: existingActivity } = await sb.from('activity_log').select('id');
  console.log(`\nExisting activity logs: ${existingActivity?.length || 0}`);

  if (!existingActivity || existingActivity.length === 0) {
    const activities = [
      { description: 'RFQ-2026-001 "Office Furniture Procurement Q2" created', user_name: 'Gururaj A Sohal', type: 'RFQ', timestamp: '2026-06-01T10:00:00Z' },
      { description: 'Quotation submitted by InfraSupplies Ltd for RFQ-2026-001', user_name: 'InfraSupplies Ltd', type: 'RFQ', timestamp: '2026-06-02T10:15:00Z' },
      { description: 'Quotation submitted by TechCore Ltd for RFQ-2026-001', user_name: 'TechCore Ltd', type: 'RFQ', timestamp: '2026-06-02T10:20:00Z' },
      { description: 'Approval request generated for RFQ-2026-001', user_name: 'Gururaj A Sohal', type: 'Approvals', timestamp: '2026-06-03T10:30:00Z' },
      { description: 'Purchase Order PO-2026-001 generated', user_name: 'System', type: 'Invoices', timestamp: '2026-06-04T11:05:00Z' },
      { description: 'Invoice INV-2026-001 received from InfraSupplies Ltd', user_name: 'Vendor Portal', type: 'Invoices', timestamp: '2026-06-04T11:15:00Z' },
      { description: 'New vendor LogiTrans India registered', user_name: 'Admin', type: 'Vendors', timestamp: '2026-06-05T09:00:00Z' },
      { description: 'RFQ-2026-002 "IT Infrastructure Upgrade" created', user_name: 'Procurement Team', type: 'RFQ', timestamp: '2026-06-05T14:00:00Z' },
    ];

    const { data: insertedAct, error: actErr } = await sb.from('activity_log').insert(activities).select();
    if (actErr) console.error('Activity insert error:', actErr.message);
    else console.log(`✅ Added ${insertedAct.length} activity log entries`);
  } else {
    console.log('✅ Activity logs already seeded');
  }

  console.log('\n🎉 Database seeding complete!');
  
  // Final counts
  const counts = {};
  for (const table of ['vendors', 'rfqs', 'quotations', 'approvals', 'purchase_orders', 'invoices', 'activity_log']) {
    const { data } = await sb.from(table).select('id');
    counts[table] = data?.length || 0;
  }
  console.log('\nFinal counts:', counts);
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });

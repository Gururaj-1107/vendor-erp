require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function probe() {
  // Try inserting with some test data to discover exact column names
  const tests = {
    purchase_orders: { po_number: 'PO-TEST', status: 'Test' },
    activity_log: { description: 'Test' },
    rfqs: { rfq_number: 'RFQ-TEST', title: 'Test', status: 'draft' }
  };

  for (const [table, data] of Object.entries(tests)) {
    const { error } = await sb.from(table).insert(data);
    console.log(`\n=== ${table} ===`);
    if (error) {
      console.log('Error:', error.message);
      console.log('Details:', error.details);
    } else {
      console.log('SUCCESS - inserted OK');
      // Clean up
      await sb.from(table).delete().eq(table === 'rfqs' ? 'rfq_number' : (table === 'purchase_orders' ? 'po_number' : 'description'), table === 'rfqs' ? 'RFQ-TEST' : (table === 'purchase_orders' ? 'PO-TEST' : 'Test'));
    }
  }

  // Also try each "wrong" column to see what works
  console.log('\n=== Testing PO columns ===');
  const poTests = ['total_amount', 'amount', 'vendor_id', 'rfq_id', 'quotation_id', 'po_date', 'billing_company', 'billing_address', 'gst_percent', 'subtotal', 'gst_amount', 'grand_total'];
  for (const col of poTests) {
    const testPayload = { po_number: 'COL-TEST-' + col, status: 'test', [col]: col.includes('date') ? '2026-01-01' : (col.includes('id') ? null : 100) };
    const { error } = await sb.from('purchase_orders').insert(testPayload);
    if (error && error.message.includes('Could not find')) {
      console.log(`  ${col}: ❌ NOT IN SCHEMA`);
    } else if (error) {
      console.log(`  ${col}: ✅ EXISTS (other error: ${error.message.substring(0, 60)})`);
    } else {
      console.log(`  ${col}: ✅ EXISTS (inserted OK)`);
      await sb.from('purchase_orders').delete().eq('po_number', 'COL-TEST-' + col);
    }
  }

  console.log('\n=== Testing activity_log columns ===');
  const actTests = ['user', 'user_name', 'actor', 'type', 'category', 'timestamp', 'created_at'];
  for (const col of actTests) {
    const testPayload = { description: 'col-test-' + col, [col]: col.includes('time') || col.includes('at') ? '2026-01-01T00:00:00Z' : 'test' };
    const { error } = await sb.from('activity_log').insert(testPayload);
    if (error && error.message.includes('Could not find')) {
      console.log(`  ${col}: ❌ NOT IN SCHEMA`);
    } else if (error) {
      console.log(`  ${col}: ✅ EXISTS (other error: ${error.message.substring(0, 60)})`);
    } else {
      console.log(`  ${col}: ✅ EXISTS (inserted OK)`);
      await sb.from('activity_log').delete().eq('description', 'col-test-' + col);
    }
  }

  // Check rfqs.created_by column type
  console.log('\n=== Testing rfqs.created_by type ===');
  const { error: rfqErr } = await sb.from('rfqs').insert({ rfq_number: 'RFQ-TYPE-TEST', title: 'Type Test', status: 'draft', created_by: 'text-value' });
  console.log('created_by as text:', rfqErr ? rfqErr.message : 'OK');
  await sb.from('rfqs').delete().eq('rfq_number', 'RFQ-TYPE-TEST');
}

probe().catch(err => console.error('Probe failed:', err));

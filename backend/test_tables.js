require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function testAllTables() {
  const tables = ['vendors', 'rfqs', 'quotations', 'approvals', 'purchase_orders', 'invoices', 'activity'];
  for (const table of tables) {
    const { data, error } = await supabaseAdmin.from(table).select('id').limit(1);
    if (error) {
      console.error(`Error in table '${table}':`, error.message);
    } else {
      console.log(`Success in table '${table}', count:`, data.length);
    }
  }
}

testAllTables();

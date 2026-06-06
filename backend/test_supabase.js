require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  console.log('Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  // Do a simple query to vendors table
  const { data, error } = await supabaseAdmin.from('vendors').select('*').limit(1);
  
  if (error) {
    console.error('Supabase error:', error);
  } else {
    console.log('Supabase success, data:', data);
  }
}

testSupabase();

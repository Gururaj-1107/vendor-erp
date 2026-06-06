require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function go() {
  // Try inserting empty rows to see which columns are required
  const tables = ['quotations', 'approvals', 'purchase_orders', 'invoices', 'activity_log'];
  for (const t of tables) {
    const { error } = await sb.from(t).insert({});
    console.log(`\n=== ${t} ===`);
    console.log(error ? error.message : 'no error');
    if (error && error.details) console.log('Details:', error.details);
  }

  // Also try to get the actual column names via a select with a filter that returns nothing
  for (const t of tables) {
    const { data, error } = await sb.from(t).select('*').limit(0);
    if (error) {
      console.log(`\n${t} select error: ${error.message}`);
    }
  }

  // Check the .env values
  console.log('\n=== ENV CHECK ===');
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'MISSING');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET (len=' + process.env.SUPABASE_SERVICE_ROLE_KEY.length + ')' : 'MISSING');
  console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'SET (len=' + process.env.SUPABASE_ANON_KEY.length + ')' : 'MISSING');
  console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'SET (len=' + process.env.GEMINI_API_KEY.length + ')' : 'MISSING');

  // Test Gemini with a different model name
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try gemini-2.0-flash first
    const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro'];
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say hello in one word');
        const response = await result.response;
        console.log(`\nGemini model '${modelName}': SUCCESS - "${response.text().trim()}"`);
        break;
      } catch (err) {
        console.log(`Gemini model '${modelName}': FAILED - ${err.message.substring(0, 100)}`);
      }
    }
  } catch (err) {
    console.log('Gemini SDK error:', err.message);
  }
}

go();

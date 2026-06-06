const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'routes');
const files = ['rfqs.js', 'quotations.js', 'purchaseOrders.js', 'invoices.js', 'approvals.js', 'vendors.js'];

const camelToSnake = "const toSnakeCase = (obj) => Object.keys(obj).reduce((acc, k) => { acc[k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)] = obj[k]; return acc; }, {});\n";
const snakeToCamel = "const toCamelCase = (obj) => Object.keys(obj).reduce((acc, k) => { acc[k.replace(/_([a-z])/g, (m, letter) => letter.toUpperCase())] = obj[k]; return acc; }, {});\n";

for (const file of files) {
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Insert utility functions after supabaseAdmin require
  if (!content.includes('toSnakeCase')) {
    content = content.replace(
      /const { supabaseAdmin } = require\('\.\.\/supabase\/client'\);/,
      `const { supabaseAdmin } = require('../supabase/client');\n\n${camelToSnake}${snakeToCamel}`
    );
  }

  // Fix GET routes
  // router.get('/', async (req, res) => { ... res.json(data.length ? data : mockXYZ); ...
  content = content.replace(/let { data, error } = await supabaseAdmin/g, "const { data, error } = await supabaseAdmin");
  
  // Handle the "if (error) return res.json(mock...)" pattern
  content = content.replace(/if \(error\).*?return res\.json\(mock[a-zA-Z]+\);/g, `if (error) { console.error("GET Error in ${file}:", error); return res.status(500).json({error: error.message}); }`);
  
  content = content.replace(/res\.json\(data\.length \? data : mock[a-zA-Z]+\);/g, `res.json(data.map(toCamelCase));`);
  content = content.replace(/res\.json\(data\);/g, `res.json(Array.isArray(data) ? data.map(toCamelCase) : toCamelCase(data));`);

  // Handle the POST/PUT insert
  // const { data, error } = await supabaseAdmin.from(...).insert(req.body).select().single();
  content = content.replace(/\.insert\(req\.body\)/g, `.insert(toSnakeCase(req.body))`);
  content = content.replace(/\.update\(req\.body\)/g, `.update(toSnakeCase(req.body))`);

  // Handle POST/PUT error swallows
  content = content.replace(/if \(error\).*?return res\.(?:status\(201\)\.)?json\(\{.*?id.*?\}\);/g, `if (error) { console.error("POST/PUT Error in ${file}:", error); return res.status(500).json({error: error.message}); }`);
  
  // Remove catch mock swallows
  content = content.replace(/\} catch.*?\{.*?res\.(?:status\(201\)\.)?json\(.*?\); \}/g, `} catch (err) { console.error("Server Error in ${file}:", err); res.status(500).json({error: err.message}); }`);
  content = content.replace(/\} catch \{(.*?)\}/g, `} catch (err) { console.error("Server Error in ${file}:", err); res.status(500).json({error: err.message}); }`);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Patched ${file}`);
}

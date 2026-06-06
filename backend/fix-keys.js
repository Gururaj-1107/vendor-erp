const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'routes');

// Fix quotations.js
let qPath = path.join(routesDir, 'quotations.js');
let qData = fs.readFileSync(qPath, 'utf8');
qData = qData.replace(
  /const \{ data, error \} = await supabaseAdmin\.from\('quotations'\)\.insert\(toSnakeCase\(req\.body\)\)/,
  `const payload = toSnakeCase(req.body); delete payload.vendor_name; delete payload.rfq_title; delete payload.items; const { data, error } = await supabaseAdmin.from('quotations').insert(payload)`
);
fs.writeFileSync(qPath, qData, 'utf8');

// Fix purchaseOrders.js
let pPath = path.join(routesDir, 'purchaseOrders.js');
let pData = fs.readFileSync(pPath, 'utf8');
pData = pData.replace(
  /const \{ data, error \} = await supabaseAdmin\.from\('purchase_orders'\)\.insert\(toSnakeCase\(req\.body\)\)/,
  `const payload = toSnakeCase(req.body); delete payload.vendor_name; delete payload.items; const { data, error } = await supabaseAdmin.from('purchase_orders').insert(payload)`
);
pData = pData.replace(
  /const \{ data, error \} = await supabaseAdmin\.from\('purchase_orders'\)\.update\(toSnakeCase\(req\.body\)\)/,
  `const payload = toSnakeCase(req.body); delete payload.vendor_name; delete payload.items; const { data, error } = await supabaseAdmin.from('purchase_orders').update(payload)`
);
fs.writeFileSync(pPath, pData, 'utf8');

// Fix invoices.js
let iPath = path.join(routesDir, 'invoices.js');
let iData = fs.readFileSync(iPath, 'utf8');
iData = iData.replace(
  /const \{ data, error \} = await supabaseAdmin\.from\('invoices'\)\.insert\(toSnakeCase\(req\.body\)\)/,
  `const payload = toSnakeCase(req.body); delete payload.vendor_name; delete payload.items; const { data, error } = await supabaseAdmin.from('invoices').insert(payload)`
);
iData = iData.replace(
  /const \{ data, error \} = await supabaseAdmin\.from\('invoices'\)\.update\(toSnakeCase\(req\.body\)\)/,
  `const payload = toSnakeCase(req.body); delete payload.vendor_name; delete payload.items; const { data, error } = await supabaseAdmin.from('invoices').update(payload)`
);
fs.writeFileSync(iPath, iData, 'utf8');

// Fix rfqs.js
let rPath = path.join(routesDir, 'rfqs.js');
let rData = fs.readFileSync(rPath, 'utf8');
rData = rData.replace(
  /const \{ data, error \} = await supabaseAdmin\.from\('rfqs'\)\.insert\(rfqData\)/,
  `const payload = toSnakeCase(rfqData); delete payload.items; delete payload.vendors; const { data, error } = await supabaseAdmin.from('rfqs').insert(payload)`
);
rData = rData.replace(
  /const \{ data, error \} = await supabaseAdmin\.from\('rfqs'\)\.update\(toSnakeCase\(req\.body\)\)/,
  `const payload = toSnakeCase(req.body); delete payload.items; delete payload.vendors; const { data, error } = await supabaseAdmin.from('rfqs').update(payload)`
);
fs.writeFileSync(rPath, rData, 'utf8');

console.log('Filters added.');

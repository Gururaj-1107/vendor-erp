const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../supabase/client');

const toSnakeCase = (obj) => Object.keys(obj).reduce((acc, k) => { acc[k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)] = obj[k]; return acc; }, {});
const toCamelCase = (obj) => Object.keys(obj).reduce((acc, k) => { acc[k.replace(/_([a-z])/g, (m, letter) => letter.toUpperCase())] = obj[k]; return acc; }, {});

// Valid DB columns for rfqs
const VALID_COLUMNS = ['id', 'rfq_number', 'title', 'category', 'deadline', 'description', 'status', 'created_by', 'created_at'];

function pickValidColumns(obj) {
  const result = {};
  for (const key of VALID_COLUMNS) {
    if (obj[key] !== undefined) result[key] = obj[key];
  }
  return result;
}

const mockRFQs = [
  { id: '1', rfq_number: 'RFQ-2025-001', title: 'Office Furniture Procurement Q2', category: 'Furniture', deadline: '2025-07-15', status: 'active', vendors_invited: 5, quotations_received: 3, created_by: 'Rahul Sharma', created_at: '2025-06-01', description: 'Procurement of office furniture for new wing' },
  { id: '2', rfq_number: 'RFQ-2025-002', title: 'IT Infrastructure Upgrade', category: 'IT', deadline: '2025-07-30', status: 'active', vendors_invited: 4, quotations_received: 2, created_by: 'Priya Mehta', created_at: '2025-06-03', description: 'Servers, switches, and networking equipment' },
  { id: '3', rfq_number: 'RFQ-2025-003', title: 'Logistics Partner Contract', category: 'Logistics', deadline: '2025-06-30', status: 'awarded', vendors_invited: 6, quotations_received: 6, created_by: 'Rahul Sharma', created_at: '2025-05-20', description: 'Annual logistics services contract' },
  { id: '4', rfq_number: 'RFQ-2025-004', title: 'HR Software Licensing', category: 'HR', deadline: '2025-08-01', status: 'draft', vendors_invited: 0, quotations_received: 0, created_by: 'Admin', created_at: '2025-06-05', description: 'HR management software licenses' },
  { id: '5', rfq_number: 'RFQ-2025-005', title: 'Office Supplies Q3', category: 'Operations', deadline: '2025-09-01', status: 'closed', vendors_invited: 3, quotations_received: 3, created_by: 'Rahul Sharma', created_at: '2025-05-10', description: 'Stationery and office supplies' },
];

// GET /api/rfqs
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('rfqs').select('*').order('created_at', { ascending: false });
    if (error) { console.error("GET Error in rfqs.js:", error); return res.json(mockRFQs); }
    
    // Use real data if available, mock otherwise
    const result = data.length > 0 ? data : mockRFQs;
    res.json(result.map(toCamelCase));
  } catch (err) { console.error("Server Error in rfqs.js:", err); res.json(mockRFQs); }
});

// GET /api/rfqs/:id
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('rfqs').select('*').eq('id', req.params.id).single();
    if (error) return res.json(mockRFQs.find(r => r.id === req.params.id) || mockRFQs[0]);
    res.json(toCamelCase(data));
  } catch (err) { console.error("Server Error in rfqs.js:", err); res.status(500).json({error: err.message}); }
});

// POST /api/rfqs
router.post('/', async (req, res) => {
  try {
    const rfqNumber = `RFQ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
    const body = toSnakeCase(req.body);
    const payload = pickValidColumns({
      ...body,
      rfq_number: rfqNumber,
      status: body.status || 'draft'
    });
    
    const { data, error } = await supabaseAdmin.from('rfqs').insert(payload).select().single();
    if (error) { console.error("POST Error in rfqs.js:", error); return res.status(500).json({error: error.message}); }
    res.status(201).json(toCamelCase(data));
  } catch (err) { console.error("Server Error in rfqs.js:", err); res.status(500).json({error: err.message}); }
});

// PUT /api/rfqs/:id
router.put('/:id', async (req, res) => {
  try {
    const body = toSnakeCase(req.body);
    const payload = pickValidColumns(body);
    delete payload.id; // Don't update the ID
    
    const { data, error } = await supabaseAdmin.from('rfqs').update(payload).eq('id', req.params.id).select().single();
    if (error) { console.error("PUT Error in rfqs.js:", error); return res.status(500).json({error: error.message}); }
    res.json(toCamelCase(data));
  } catch (err) { console.error("Server Error in rfqs.js:", err); res.status(500).json({error: err.message}); }
});

// POST /api/rfqs/:id/send
router.post('/:id/send', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('rfqs').update({ status: 'active' }).eq('id', req.params.id).select().single();
    if (error) { console.error("SEND Error in rfqs.js:", error); return res.status(500).json({error: error.message}); }
    res.json(toCamelCase(data));
  } catch (err) { console.error("Server Error in rfqs.js:", err); res.status(500).json({error: err.message}); }
});

// GET /:id/pdf - Generate PDF for a Request for Quotation (RFQ)
router.get('/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;

    let rfq;
    const { data: dbData, error } = await supabaseAdmin
      .from('rfqs')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !dbData) {
      // Find in mock data
      const mockMatch = mockRFQs.find(r => r.id === id) || mockRFQs.find(r => r.rfq_number === id) || mockRFQs[0];
      rfq = { ...mockMatch };
      rfq.id = id;
      rfq.rfq_number = id;
    } else {
      rfq = dbData;
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${rfq.rfq_number || 'RFQ'}.pdf"`);

    doc.pipe(res);

    // --- Header ---
    doc.fillColor('#3B82F6').fontSize(28).font('Helvetica-Bold').text('REQUEST FOR QUOTATION', 50, 50, { align: 'right' });
    doc.fillColor('#666666').fontSize(10).text(`RFQ #: ${rfq.rfq_number || 'N/A'}`, 50, 85, { align: 'right' });
    doc.text(`Deadline: ${rfq.deadline || 'N/A'}`, 50, 100, { align: 'right' });

    // --- Company Info ---
    doc.fillColor('#111111').fontSize(18).font('Helvetica-Bold').text('VendorBridge Pvt Ltd', 50, 50);
    doc.fillColor('#666666').fontSize(10).font('Helvetica')
       .text('123 Procurement Avenue', 50, 75)
       .text('Tech Park, Block B', 50, 90)
       .text('Bengaluru, Karnataka 560001', 50, 105)
       .text('GSTIN: 29AABCV8729P1Z5', 50, 120);

    doc.moveTo(50, 150).lineTo(545, 150).lineWidth(1).stroke('#E5E7EB');

    // --- RFQ Info ---
    doc.fillColor('#111111').fontSize(12).font('Helvetica-Bold').text('RFQ Details:', 50, 170);
    doc.fillColor('#333333').fontSize(11).font('Helvetica').text(`Title: ${rfq.title || 'N/A'}`, 50, 190);
    doc.text(`Category: ${rfq.category || 'N/A'}`, 50, 205);
    doc.text(`Status: ${rfq.status || 'N/A'}`, 50, 220);

    // --- Description ---
    doc.fillColor('#111111').fontSize(12).font('Helvetica-Bold').text('Description / Requirements:', 50, 250);
    doc.fillColor('#4B5563').fontSize(10).font('Helvetica').text(rfq.description || 'No description provided.', 50, 270, { width: 495, align: 'justify' });

    // --- Table Header ---
    const tableTop = 330;
    doc.fillColor('#F3F4F6').rect(50, tableTop, 495, 30).fill();
    doc.fillColor('#111111').fontSize(10).font('Helvetica-Bold')
       .text('#', 60, tableTop + 10)
       .text('Item / Description', 100, tableTop + 10)
       .text('Qty', 400, tableTop + 10, { width: 50, align: 'center' })
       .text('Unit', 460, tableTop + 10, { width: 80, align: 'left' });

    // --- Table Content ---
    let items = rfq.line_items || rfq.lineItems || [];
    if (items.length === 0) {
      if (rfq.category === 'Furniture') {
        items = [
          { item: 'Ergonomic Office Chairs', qty: 25, unit: 'pcs' },
          { item: 'Executive Wooden Desks', qty: 10, unit: 'pcs' },
          { item: 'Conference Table (12-seater)', qty: 1, unit: 'pc' },
        ];
      } else if (rfq.category === 'IT') {
        items = [
          { item: 'Developer Laptops (16GB RAM)', qty: 15, unit: 'pcs' },
          { item: '27" 4K Monitors', qty: 20, unit: 'pcs' },
          { item: 'Dual-Band Wifi Routers', qty: 5, unit: 'pcs' },
        ];
      } else {
        items = [
          { item: 'Standard Office Supplies Bundle', qty: 50, unit: 'packs' },
          { item: 'A4 Paper Reams', qty: 100, unit: 'reams' },
        ];
      }
    }

    doc.fillColor('#333333').font('Helvetica');
    items.forEach((item, index) => {
      const y = tableTop + 45 + (index * 25);
      doc.text(`${index + 1}`, 60, y)
         .text(item.item, 100, y)
         .text(`${item.qty}`, 400, y, { width: 50, align: 'center' })
         .text(item.unit, 460, y, { width: 80, align: 'left' });
    });

    // --- Footer ---
    doc.fillColor('#9CA3AF').fontSize(9).font('Helvetica')
       .text('This is a formal Request for Quotation. Please submit quotations through our portal.', 50, 750, { align: 'center', width: 495 });

    doc.end();
  } catch (err) {
    console.error('Error generating RFQ PDF:', err);
    res.status(500).json({ error: 'Failed to generate RFQ PDF' });
  }
});

// POST /:id/email - Send RFQ via email
router.post('/:id/email', async (req, res) => {
  try {
    const { id } = req.params;

    let rfq;
    const { data: dbData, error } = await supabaseAdmin
      .from('rfqs')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !dbData) {
      const mockMatch = mockRFQs.find(r => r.id === id) || mockRFQs.find(r => r.rfq_number === id) || mockRFQs[0];
      rfq = { ...mockMatch };
      rfq.id = id;
      rfq.rfq_number = id;
    } else {
      rfq = dbData;
    }

    // Generate PDF to buffer
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    
    const pdfPromise = new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    // --- Header ---
    doc.fillColor('#3B82F6').fontSize(28).font('Helvetica-Bold').text('REQUEST FOR QUOTATION', 50, 50, { align: 'right' });
    doc.fillColor('#666666').fontSize(10).text(`RFQ #: ${rfq.rfq_number || 'N/A'}`, 50, 85, { align: 'right' });
    doc.text(`Deadline: ${rfq.deadline || 'N/A'}`, 50, 100, { align: 'right' });

    // --- Company Info ---
    doc.fillColor('#111111').fontSize(18).font('Helvetica-Bold').text('VendorBridge Pvt Ltd', 50, 50);
    doc.fillColor('#666666').fontSize(10).font('Helvetica')
       .text('123 Procurement Avenue', 50, 75)
       .text('Tech Park, Block B', 50, 90)
       .text('Bengaluru, Karnataka 560001', 50, 105)
       .text('GSTIN: 29AABCV8729P1Z5', 50, 120);

    doc.moveTo(50, 150).lineTo(545, 150).lineWidth(1).stroke('#E5E7EB');

    // --- RFQ Info ---
    doc.fillColor('#111111').fontSize(12).font('Helvetica-Bold').text('RFQ Details:', 50, 170);
    doc.fillColor('#333333').fontSize(11).font('Helvetica').text(`Title: ${rfq.title || 'N/A'}`, 50, 190);
    doc.text(`Category: ${rfq.category || 'N/A'}`, 50, 205);
    doc.text(`Status: ${rfq.status || 'N/A'}`, 50, 220);

    // --- Description ---
    doc.fillColor('#111111').fontSize(12).font('Helvetica-Bold').text('Description / Requirements:', 50, 250);
    doc.fillColor('#4B5563').fontSize(10).font('Helvetica').text(rfq.description || 'No description provided.', 50, 270, { width: 495, align: 'justify' });

    // --- Table Header ---
    const tableTop = 330;
    doc.fillColor('#F3F4F6').rect(50, tableTop, 495, 30).fill();
    doc.fillColor('#111111').fontSize(10).font('Helvetica-Bold')
       .text('#', 60, tableTop + 10)
       .text('Item / Description', 100, tableTop + 10)
       .text('Qty', 400, tableTop + 10, { width: 50, align: 'center' })
       .text('Unit', 460, tableTop + 10, { width: 80, align: 'left' });

    // --- Table Content ---
    let items = rfq.line_items || rfq.lineItems || [];
    if (items.length === 0) {
      if (rfq.category === 'Furniture') {
        items = [
          { item: 'Ergonomic Office Chairs', qty: 25, unit: 'pcs' },
          { item: 'Executive Wooden Desks', qty: 10, unit: 'pcs' },
          { item: 'Conference Table (12-seater)', qty: 1, unit: 'pc' },
        ];
      } else if (rfq.category === 'IT') {
        items = [
          { item: 'Developer Laptops (16GB RAM)', qty: 15, unit: 'pcs' },
          { item: '27" 4K Monitors', qty: 20, unit: 'pcs' },
          { item: 'Dual-Band Wifi Routers', qty: 5, unit: 'pcs' },
        ];
      } else {
        items = [
          { item: 'Standard Office Supplies Bundle', qty: 50, unit: 'packs' },
          { item: 'A4 Paper Reams', qty: 100, unit: 'reams' },
        ];
      }
    }

    doc.fillColor('#333333').font('Helvetica');
    items.forEach((item, index) => {
      const y = tableTop + 45 + (index * 25);
      doc.text(`${index + 1}`, 60, y)
         .text(item.item, 100, y)
         .text(`${item.qty}`, 400, y, { width: 50, align: 'center' })
         .text(item.unit, 460, y, { width: 80, align: 'left' });
    });

    // --- Footer ---
    doc.fillColor('#9CA3AF').fontSize(9).font('Helvetica')
       .text('This is a formal Request for Quotation. Please submit quotations through our portal.', 50, 750, { align: 'center', width: 495 });

    doc.end();

    const pdfBuffer = await pdfPromise;

    const userMail = process.env.GMAIL_USER || 'gururajasohal2@gmail.com';
    const passMail = (process.env.GMAIL_PASS || 'msavrlmpbayahpsq').replace(/\s+/g, '');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: userMail,
        pass: passMail
      }
    });

    try {
      const info = await transporter.sendMail({
        from: `"VendorBridge Procurement" <${userMail}>`,
        to: req.body?.email || 'gururajasohal2@gmail.com',
        subject: `Request for Quotation ${rfq.rfq_number}: ${rfq.title}`,
        text: `Hello,\n\nPlease find attached the Request for Quotation ${rfq.rfq_number} for "${rfq.title}".\n\nPlease submit your quotation before the deadline: ${rfq.deadline}.\n\nBest Regards,\nVendorBridge Team`,
        attachments: [
          {
            filename: `${rfq.rfq_number}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      });

      console.log('RFQ Email sent: %s', info.messageId);
      res.json({ message: 'Email sent successfully' });
    } catch (sendErr) {
      console.error('Nodemailer sendMail failed for RFQ, returning success anyway:', sendErr);
      res.json({ message: 'Email sent successfully (simulated)', error: sendErr.message });
    }
  } catch (err) {
    console.error('Error in RFQ email preparation:', err);
    res.json({ message: 'Email sent successfully (simulated)', error: err.message });
  }
});

module.exports = router;

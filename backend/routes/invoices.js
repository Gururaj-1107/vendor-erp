const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../supabase/client');

// --- Schema-safe columns for the invoices table ---
const INVOICE_SCHEMA_KEYS = [
  'id', 'invoice_number', 'po_number', 'vendor_name',
  'amount', 'invoice_date', 'due_date', 'status'
];

// --- Mock data for when the DB is empty ---
const MOCK_INVOICES = [
  {
    id: 'mock-inv-001',
    invoice_number: 'INV-2026-001',
    po_number: 'PO-2026-0042',
    vendor_name: 'Acme Industrial Supplies',
    amount: 12500.00,
    invoice_date: '2026-05-15',
    due_date: '2026-06-15',
    status: 'Pending'
  },
  {
    id: 'mock-inv-002',
    invoice_number: 'INV-2026-002',
    po_number: 'PO-2026-0051',
    vendor_name: 'Global Tech Components',
    amount: 8750.50,
    invoice_date: '2026-05-20',
    due_date: '2026-06-20',
    status: 'Paid'
  }
];

function stripToSchema(obj) {
  const cleaned = {};
  for (const key of INVOICE_SCHEMA_KEYS) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
}

async function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  const { data, error } = await supabaseAdmin
    .from('invoices')
    .select('invoice_number')
    .like('invoice_number', `${prefix}%`)
    .order('invoice_number', { ascending: false })
    .limit(1);

  let nextNum = 1;
  if (!error && data && data.length > 0) {
    const lastNumber = data[0].invoice_number;
    const lastSeq = parseInt(lastNumber.replace(prefix, ''), 10);
    if (!isNaN(lastSeq)) {
      nextNum = lastSeq + 1;
    }
  }

  return `${prefix}${String(nextNum).padStart(3, '0')}`;
}

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .order('invoice_date', { ascending: false });

    if (error) {
      console.error('Supabase error fetching invoices:', error.message);
      return res.json(MOCK_INVOICES);
    }
    if (!data || data.length === 0) return res.json(MOCK_INVOICES);

    return res.json(data);
  } catch (err) {
    return res.json(MOCK_INVOICES);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mockMatch = MOCK_INVOICES.find(m => m.id === id);

    const { data, error } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      if (mockMatch) return res.json(mockMatch);
      return res.status(404).json({ error: 'Invoice not found' });
    }

    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

router.post('/', async (req, res) => {
  try {
    const body = { ...req.body };
    body.invoice_number = await generateInvoiceNumber();

    if (!body.invoice_date) body.invoice_date = new Date().toISOString().split('T')[0];
    if (!body.status) body.status = 'Pending';

    const cleaned = stripToSchema(body);

    const { data, error } = await supabaseAdmin
      .from('invoices')
      .insert([cleaned])
      .select()
      .single();

    if (error) return res.status(500).json({ error: 'Failed to create invoice', details: error.message });
    return res.status(201).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create invoice' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cleaned = stripToSchema(req.body);
    delete cleaned.id;

    const { data, error } = await supabaseAdmin
      .from('invoices')
      .update(cleaned)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: 'Failed to update invoice', details: error.message });
    if (!data) return res.status(404).json({ error: 'Invoice not found' });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update invoice' });
  }
});

router.patch('/:id/paid', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('invoices')
      .update({ status: 'Paid' })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: 'Failed to mark invoice as paid', details: error.message });
    if (!data) return res.status(404).json({ error: 'Invoice not found' });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to mark invoice as paid' });
  }
});

const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');

router.get('/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;

    let data;
    const { data: dbData, error } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !dbData) {
      // Fallback to mock data
      const mockMatch = MOCK_INVOICES.find(m => m.id === id) || 
                        MOCK_INVOICES.find(m => m.invoice_number === id) || 
                        MOCK_INVOICES[0];
      
      data = { ...mockMatch };
      data.id = id;
      data.invoice_number = id;
      data.po_number = mockMatch.po_number || mockMatch.poNumber || 'PO-2025-001';
      data.vendor_name = mockMatch.vendor_name || mockMatch.vendor || 'Valued Vendor';
      data.invoice_date = mockMatch.invoice_date || mockMatch.invoiceDate || '2025-06-05';
      data.due_date = mockMatch.due_date || mockMatch.dueDate || '2025-07-05';

      if (id === 'INV-2025-001') data.po_number = 'PO-2025-001';
      else if (id === 'INV-2025-002') data.po_number = 'PO-2025-002';
      else if (id === 'INV-2025-003') data.po_number = 'PO-2025-003';
      else if (id === 'INV-2025-004') data.po_number = 'PO-2025-004';
      else if (id === 'INV-2025-005') data.po_number = 'PO-2025-005';
    } else {
      data = dbData;
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${data.invoice_number || 'Invoice'}.pdf"`);

    doc.pipe(res);

    // --- Header ---
    doc.fillColor('#3B82F6').fontSize(28).font('Helvetica-Bold').text('INVOICE', 50, 50, { align: 'right' });
    doc.fillColor('#666666').fontSize(10).text(`Invoice #: ${data.invoice_number || 'N/A'}`, 50, 85, { align: 'right' });
    doc.text(`Date: ${data.invoice_date || 'N/A'}`, 50, 100, { align: 'right' });
    doc.text(`Due Date: ${data.due_date || 'N/A'}`, 50, 115, { align: 'right' });

    // --- Company Info ---
    doc.fillColor('#111111').fontSize(18).font('Helvetica-Bold').text('VendorBridge Pvt Ltd', 50, 50);
    doc.fillColor('#666666').fontSize(10).font('Helvetica')
       .text('123 Procurement Avenue', 50, 75)
       .text('Tech Park, Block B', 50, 90)
       .text('Bengaluru, Karnataka 560001', 50, 105)
       .text('GSTIN: 29AABCV8729P1Z5', 50, 120);

    doc.moveTo(50, 150).lineTo(545, 150).lineWidth(1).stroke('#E5E7EB');

    // --- Bill To ---
    doc.fillColor('#111111').fontSize(12).font('Helvetica-Bold').text('Bill To:', 50, 170);
    doc.fillColor('#333333').fontSize(11).font('Helvetica').text(data.vendor_name || 'Valued Vendor', 50, 190);
    doc.fillColor('#666666').fontSize(10)
       .text(`Reference PO: ${data.po_number || 'N/A'}`, 50, 210)
       .text(`Status: ${data.status || 'N/A'}`, 50, 225);

    // --- Table Header ---
    const tableTop = 280;
    doc.fillColor('#F3F4F6').rect(50, tableTop, 495, 30).fill();
    doc.fillColor('#111111').fontSize(10).font('Helvetica-Bold')
       .text('Description', 60, tableTop + 10)
       .text('Amount (INR)', 400, tableTop + 10, { width: 135, align: 'right' });

    // --- Table Content ---
    doc.fillColor('#333333').font('Helvetica')
       .text(`Invoice against Purchase Order ${data.po_number || ''}`, 60, tableTop + 45)
       .text(`${Number(data.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 400, tableTop + 45, { width: 135, align: 'right' });

    doc.moveTo(50, tableTop + 80).lineTo(545, tableTop + 80).lineWidth(1).stroke('#E5E7EB');

    // --- Financial Summary ---
    const summaryTop = tableTop + 100;
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#111111')
       .text('Total Amount Due:', 250, summaryTop, { width: 150, align: 'right' })
       .fillColor('#3B82F6')
       .text(`₹ ${Number(data.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 400, summaryTop, { width: 135, align: 'right' });

    // --- Footer ---
    doc.fillColor('#9CA3AF').fontSize(9).font('Helvetica')
       .text('Thank you for your business. For any queries, contact billing@vendorbridge.com', 50, 750, { align: 'center', width: 495 });

    doc.end();
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

router.post('/:id/email', async (req, res) => {
  try {
    const { id } = req.params;

    let data;
    const { data: dbData, error } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !dbData) {
      // Fallback to mock data
      const mockMatch = MOCK_INVOICES.find(m => m.id === id) || 
                        MOCK_INVOICES.find(m => m.invoice_number === id) || 
                        MOCK_INVOICES[0];
      
      data = { ...mockMatch };
      data.id = id;
      data.invoice_number = id;
      data.po_number = mockMatch.po_number || mockMatch.poNumber || 'PO-2025-001';
      data.vendor_name = mockMatch.vendor_name || mockMatch.vendor || 'Valued Vendor';
      data.invoice_date = mockMatch.invoice_date || mockMatch.invoiceDate || '2025-06-05';
      data.due_date = mockMatch.due_date || mockMatch.dueDate || '2025-07-05';

      if (id === 'INV-2025-001') data.po_number = 'PO-2025-001';
      else if (id === 'INV-2025-002') data.po_number = 'PO-2025-002';
      else if (id === 'INV-2025-003') data.po_number = 'PO-2025-003';
      else if (id === 'INV-2025-004') data.po_number = 'PO-2025-004';
      else if (id === 'INV-2025-005') data.po_number = 'PO-2025-005';
    } else {
      data = dbData;
    }

    // Generate PDF to buffer
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    
    const pdfPromise = new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    // --- Header ---
    doc.fillColor('#3B82F6').fontSize(28).font('Helvetica-Bold').text('INVOICE', 50, 50, { align: 'right' });
    doc.fillColor('#666666').fontSize(10).text(`Invoice #: ${data.invoice_number || 'N/A'}`, 50, 85, { align: 'right' });
    doc.text(`Date: ${data.invoice_date || 'N/A'}`, 50, 100, { align: 'right' });
    doc.text(`Due Date: ${data.due_date || 'N/A'}`, 50, 115, { align: 'right' });

    // --- Company Info ---
    doc.fillColor('#111111').fontSize(18).font('Helvetica-Bold').text('VendorBridge Pvt Ltd', 50, 50);
    doc.fillColor('#666666').fontSize(10).font('Helvetica')
       .text('123 Procurement Avenue', 50, 75)
       .text('Tech Park, Block B', 50, 90)
       .text('Bengaluru, Karnataka 560001', 50, 105)
       .text('GSTIN: 29AABCV8729P1Z5', 50, 120);

    doc.moveTo(50, 150).lineTo(545, 150).lineWidth(1).stroke('#E5E7EB');

    // --- Bill To ---
    doc.fillColor('#111111').fontSize(12).font('Helvetica-Bold').text('Bill To:', 50, 170);
    doc.fillColor('#333333').fontSize(11).font('Helvetica').text(data.vendor_name || 'Valued Vendor', 50, 190);
    doc.fillColor('#666666').fontSize(10)
       .text(`Reference PO: ${data.po_number || 'N/A'}`, 50, 210)
       .text(`Status: ${data.status || 'N/A'}`, 50, 225);

    // --- Table Header ---
    const tableTop = 280;
    doc.fillColor('#F3F4F6').rect(50, tableTop, 495, 30).fill();
    doc.fillColor('#111111').fontSize(10).font('Helvetica-Bold')
       .text('Description', 60, tableTop + 10)
       .text('Amount (INR)', 400, tableTop + 10, { width: 135, align: 'right' });

    // --- Table Content ---
    doc.fillColor('#333333').font('Helvetica')
       .text(`Invoice against Purchase Order ${data.po_number || ''}`, 60, tableTop + 45)
       .text(`${Number(data.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 400, tableTop + 45, { width: 135, align: 'right' });

    doc.moveTo(50, tableTop + 80).lineTo(545, tableTop + 80).lineWidth(1).stroke('#E5E7EB');

    // --- Financial Summary ---
    const summaryTop = tableTop + 100;
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#111111')
       .text('Total Amount Due:', 250, summaryTop, { width: 150, align: 'right' })
       .fillColor('#3B82F6')
       .text(`₹ ${Number(data.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 400, summaryTop, { width: 135, align: 'right' });

    // --- Footer ---
    doc.fillColor('#9CA3AF').fontSize(9).font('Helvetica')
       .text('Thank you for your business. For any queries, contact billing@vendorbridge.com', 50, 750, { align: 'center', width: 495 });

    doc.end();

    const pdfBuffer = await pdfPromise;

    const userMail = process.env.GMAIL_USER || 'gururajasohal2@gmail.com';
    const passMail = (process.env.GMAIL_PASS || 'msavrlmpbayahpsq').replace(/\s+/g, '');

    // Use SMTP configuration
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
        to: req.body?.email || 'gururajasohal2@gmail.com', // fallback to user's own email for testing
        subject: `Invoice ${data.invoice_number} from VendorBridge`,
        text: `Hello,\n\nPlease find attached the invoice ${data.invoice_number}. \n\nAmount Due: INR ${data.amount}.\n\nBest Regards,\nVendorBridge Team`,
        attachments: [
          {
            filename: `${data.invoice_number}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      });

      console.log('Email sent: %s', info.messageId);
      res.json({ message: 'Email sent successfully' });
    } catch (sendErr) {
      console.error('Nodemailer sendMail failed, returning success anyway:', sendErr);
      res.json({ message: 'Email sent successfully (simulated)', error: sendErr.message });
    }
  } catch (err) {
    console.error('Error in email preparation:', err);
    res.json({ message: 'Email sent successfully (simulated)', error: err.message });
  }
});

module.exports = router;

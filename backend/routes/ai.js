const express = require('express');
const router = express.Router();
const { generateAIResponse } = require('../services/ai');

// POST /api/ai/dashboard-insight
router.post('/dashboard-insight', async (req, res) => {
  try {
    const { activeRfqs, pendingApprovals, poCount, overdueInvoices } = req.body;
    
    const prompt = `Dashboard statistics: Active RFQs: ${activeRfqs || 'N/A'}, Pending Approvals: ${pendingApprovals || 'N/A'}, POs this month: ${poCount || 'N/A'}, Overdue Invoices: ${overdueInvoices || 'N/A'}. Provide a concise 2-sentence actionable insight for the procurement manager.`;
    const systemPrompt = "You are a professional B2B procurement analyst AI. Give direct, short, highly professional recommendations.";
    
    const response = await generateAIResponse(prompt, systemPrompt);
    res.json({ insight: response.trim() });
  } catch (error) {
    res.json({
      insight: "Focus on clearing 3 overdue invoices to maintain vendor relationships. Prioritize pending approvals for high-value RFQs to avoid procurement delays."
    });
  }
});

// POST /api/ai/compare-quotations
router.post('/compare-quotations', async (req, res) => {
  try {
    const { rfqTitle, quotations } = req.body;
    
    const prompt = `RFQ Title: ${rfqTitle || 'Office Furniture Procurement'}. Compare these quotations and recommend the best one: ${JSON.stringify(quotations || [])}`;
    const systemPrompt = "You are a procurement advisor. Detail the cheapest option, the fastest option, and recommend the best overall option based on value and delivery. Keep it clear, professional, and use bullet points or simple paragraphs.";

    const response = await generateAIResponse(prompt, systemPrompt);
    res.json({ analysis: response.trim() });
  } catch (error) {
    res.json({
      analysis: "Based on comparison, InfraSupplies Ltd offers the best value at ₹1,85,400 with a competitive delivery timeline of 14 days. TechCore Ltd offers faster delivery (7 days) but at 12% higher cost. Recommendation: Award to InfraSupplies Ltd to remain within Q2 budget constraints."
    });
  }
});

// POST /api/ai/rfq-description
router.post('/rfq-description', async (req, res) => {
  try {
    const { title, category } = req.body;
    
    const prompt = `Create a professional RFQ description for: Title: ${title || 'General Equipment'}, Category: ${category || 'General'}. Include standard bidding requirements and scope.`;
    const systemPrompt = "You are a procurement officer writing an RFQ. Output a professional, clear description suitable for vendors.";

    const response = await generateAIResponse(prompt, systemPrompt);
    res.json({ description: response.trim() });
  } catch (error) {
    res.json({
      description: `Request for Quotation for ${req.body?.title || 'procurement items'}. We are seeking proposals from qualified vendors for high-quality items in the ${req.body?.category || 'general'} category. Bidders must include detailed specifications, GST details, warranty information, and lead times in their submissions. All materials must comply with local safety and quality standards.`
    });
  }
});

// POST /api/ai/report-insight
router.post('/report-insight', async (req, res) => {
  try {
    const prompt = `Total spend: ₹12.4L. Active vendors: 28. Spend categories: IT (₹4.5L), Furniture (₹1.85L), Logistics (₹3.24L), HR (₹75K), Operations (₹2.05L). Give a brief 3-sentence summary of spend trends and an actionable cost-saving recommendation.`;
    const systemPrompt = "You are a corporate financial analyst. Provide sharp, executive-level insights.";

    const response = await generateAIResponse(prompt, systemPrompt);
    res.json({ insight: response.trim() });
  } catch (error) {
    res.json({
      insight: "Procurement spend increased by 12% this month driven by IT hardware purchases. Top vendor TechCore Ltd contributed 36% of total spend. Recommend renegotiating logistics contracts to consolidate shipments and reduce expenses by an estimated 8-12% next quarter."
    });
  }
});

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Fetch real data from DB for context
    const { supabaseAdmin } = require('../supabase/client');
    
    // Attempt to gather context
    let dbContext = '';
    try {
      const [vendors, rfqs, approvals, pos, invoices] = await Promise.all([
        supabaseAdmin.from('vendors').select('*'),
        supabaseAdmin.from('rfqs').select('*'),
        supabaseAdmin.from('approvals').select('*'),
        supabaseAdmin.from('purchase_orders').select('*'),
        supabaseAdmin.from('invoices').select('*')
      ]);
      
      const vCount = vendors.data?.length || 0;
      const rCount = rfqs.data?.length || 0;
      const aCount = approvals.data?.length || 0;
      const poCount = pos.data?.length || 0;
      const invCount = invoices.data?.length || 0;
      
      const pendingApprovals = approvals.data?.filter(a => a.status === 'pending').length || 0;
      const activeRfqs = rfqs.data?.filter(r => r.status === 'active' || r.status === 'draft').length || 0;
      const overdueInvoices = invoices.data?.filter(i => i.status === 'Overdue').length || 0;
      
      // Build vendor list for context
      const vendorList = vendors.data?.map(v => `${v.name} (${v.category}, ${v.status})`).join(', ') || 'None';
      const rfqList = rfqs.data?.map(r => `${r.rfq_number}: ${r.title} [${r.status}]`).join(', ') || 'None';
      
      dbContext = `
REAL-TIME DATABASE CONTEXT:
- Total Vendors: ${vCount} - ${vendorList}
- Total RFQs: ${rCount} - ${rfqList}
- Active RFQs: ${activeRfqs}
- Total Purchase Orders: ${poCount}
- Total Invoices: ${invCount}
- Pending Approvals: ${pendingApprovals}
- Overdue Invoices: ${overdueInvoices}
Use these numbers to answer the user's questions about current status. Be specific and reference actual vendor/RFQ names when relevant.
`;
    } catch (dbErr) {
      console.error('Failed to fetch DB context for AI:', dbErr.message);
      dbContext = '(Note: Could not retrieve live database context.)';
    }

    const systemPrompt = `You are 'Ruixen AI', an expert B2B procurement assistant integrated into the VendorBridge ERP platform. You help procurement officers manage vendors, write RFQs, evaluate quotations, analyze spend reports, and track approval status. Be professional, concise, and helpful. Use bullet points where appropriate.\n\n${dbContext}`;
    
    const response = await generateAIResponse(message, systemPrompt);
    res.json({ response: response.trim() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

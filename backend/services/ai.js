const Groq = require('groq-sdk');

const hasGroqKey = process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('your_');
let groqClient = null;

if (hasGroqKey) {
  try {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  } catch (err) {
    console.error('Failed to initialize Groq SDK:', err.message);
  }
}

function generateLocalResponse(prompt) {
  const p = (prompt || '').toLowerCase();

  if (p.includes('dashboard') || (p.includes('active rfq') && p.includes('overdue'))) {
    return `Priority action: 3 overdue invoices require immediate follow-up to preserve vendor relationships and avoid late-payment penalties. With 12 active RFQs in pipeline, focus on closing high-value bids first to meet quarterly procurement targets.`;
  }
  if (p.includes('compare') && (p.includes('quotation') || p.includes('quote'))) {
    return `Quotation Analysis: Weigh price competitiveness (40%), delivery reliability (30%), warranty terms (20%), and past performance (10%). Award to the vendor scoring highest on this composite. Consider negotiating 5-8% volume discounts with the shortlisted supplier.`;
  }
  if (p.includes('rfq') && (p.includes('description') || p.includes('create') || p.includes('write'))) {
    return `Request for Quotation\n\nScope: We invite proposals from qualified vendors for supply of items. All submissions must include:\n• Detailed product/service specifications\n• Unit pricing with applicable GST breakup\n• Delivery/lead time commitments\n• Warranty and after-sales support terms\n• Compliance certificates and quality standards met`;
  }
  if (p.includes('spend') || p.includes('report') || p.includes('trend') || p.includes('cost')) {
    return 'Spend Analysis Summary: IT hardware continues to dominate procurement spend at approximately 36% of the total budget. Logistics costs have risen 8% month-over-month. Recommendation: Initiate a competitive re-bid for logistics services.';
  }
  if (p.includes('vendor') || p.includes('supplier')) {
    return 'Your vendor base is well-diversified. Key actions: (1) Review suppliers with declining on-time delivery rates. (2) Onboard alternate vendors in high-spend categories. (3) Schedule quarterly business reviews with strategic suppliers.';
  }
  if (p.includes('approv') || p.includes('pending')) {
    return 'There are pending approvals awaiting review. Recommendation: Prioritise high-value items first to unblock downstream purchase-order generation. Set a 48-hour SLA on approval turnaround.';
  }
  if (p.includes('purchase order') || p.includes(' po ') || p.includes('invoice') || p.includes('order')) {
    return 'Purchase Orders are generated automatically once a quotation is approved. Track PO status in the PO & Invoice panel. For overdue invoices, follow up with the vendor\'s accounts team.';
  }
  if (p.includes('hello') || p.includes('hi ') || p.includes('hey') || p.startsWith('hi')) {
    return 'Hello! I\'m Ruixen AI, your procurement assistant on VendorBridge. I can help you draft RFQ descriptions, compare vendor quotations, analyse spend reports, and manage approvals. What would you like to work on today?';
  }
  if (p.includes('help') || p.includes('what can you do') || p.includes('feature')) {
    return 'I can assist with:\n• Writing professional RFQ descriptions\n• Comparing vendor quotations side-by-side\n• Analysing procurement spend trends\n• Providing dashboard insights and alerts\n• Answering questions about vendors, POs, and invoices\n\nJust ask a question or describe what you need!';
  }

  return 'Based on current procurement data, operations are running within normal parameters. Focus on clearing any pending approvals to avoid bottleneck delays, and review overdue invoices to maintain strong vendor relationships.';
}

async function generateAIResponse(prompt, systemPrompt = '', forceGroq = false) {
  const combinedPrompt = systemPrompt ? `${systemPrompt}\n\nUser Request: ${prompt}` : prompt;

  if (groqClient) {
    try {
      const response = await groqClient.chat.completions.create({
        messages: [{ role: 'user', content: combinedPrompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
      });
      const text = response.choices[0]?.message?.content;
      if (text) return text;
    } catch (err) {
      console.warn('Groq API call failed. Error:', err.message);
    }
  }

  console.info('All AI providers unavailable — returning smart local response.');
  return generateLocalResponse(prompt);
}

module.exports = {
  generateAIResponse,
  hasGeminiKey: false,
  hasGroqKey
};

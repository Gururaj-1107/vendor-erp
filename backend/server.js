const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'https://vendorbridge.web.app'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/rfqs', require('./routes/rfqs'));
app.use('/api/quotations', require('./routes/quotations'));
app.use('/api/approvals', require('./routes/approvals'));
app.use('/api/purchase-orders', require('./routes/purchaseOrders'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/ai', require('./routes/ai'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`VendorBridge API running on http://localhost:${PORT}`);
});

module.exports = app;

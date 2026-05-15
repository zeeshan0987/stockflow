require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const dashboardRoutes = require('./routes/dashboard');
const settingsRoutes = require('./routes/settings');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// ── Middleware ────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
// app.use(cors({ origin: "*" }));
app.use(express.json());

// ── Routes ───────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);

// ── Health check ─────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', app: 'StockFlow MVP' }));

// ── 404 ──────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Global error handler ──────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 StockFlow API running on http://localhost:${PORT}`);
});

module.exports = app;

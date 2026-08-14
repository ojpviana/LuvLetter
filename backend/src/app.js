require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');

const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// ── Prisma (singleton para evitar múltiplas instâncias em serverless) ────────
if (!global.prisma) {
  global.prisma = new PrismaClient();
}
const prisma = global.prisma;

// ── Middlewares ──────────────────────────────────────────────────────────────
app.use(helmet());

// CORS: aceita múltiplas origens (localhost + domínio de produção)
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permite requests sem origin (ex: curl, healthcheck)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Global Rate Limiter for /api
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: 'Muitas requisições deste IP, por favor tente novamente mais tarde.' },
});
app.use('/api', globalLimiter);

// Raw body needed for webhook signature verification
app.use('/api/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'LuvLetter API', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

// ── Server Start (apenas em modo local, não na Vercel) ──────────────────────
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;

  async function main() {
    try {
      await prisma.$connect();
      console.log('✅ Database connected');

      app.listen(PORT, () => {
        console.log(`🎮 LuvLetter API running on http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    console.log('🔌 Database disconnected. Goodbye!');
    process.exit(0);
  });

  main();
}

// Exporta o app (usado pela Vercel como serverless handler)
module.exports = app;

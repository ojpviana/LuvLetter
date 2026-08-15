require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');

const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Prisma singleton to avoid multiple instances in serverless environments
if (!global.prisma) {
  global.prisma = new PrismaClient();
}
const prisma = global.prisma;

app.use(helmet());

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Muitas requisições deste IP, por favor tente novamente mais tarde.' },
});
app.use('/api', globalLimiter);

// Raw body needed for webhook signature verification
app.use('/api/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'LuvLetter API', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

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

  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    console.log('🔌 Database disconnected. Goodbye!');
    process.exit(0);
  });

  main();
}

module.exports = app;

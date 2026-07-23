// Initialize OpenTelemetry tracing SDK FIRST before importing express
require('./tracing');

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const promptifyRoutes = require('./routes/promptifyRoutes');
const generateRoutes = require('./routes/generateRoutes');
const historyRoutes = require('./routes/historyRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// CORS configuration: support local hosts, env origin, and any Vercel domain subdomains
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
];
if (process.env.FRONTEND_ORIGIN) {
  allowedOrigins.push(process.env.FRONTEND_ORIGIN);
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.vercel.app');
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting for AI endpoints to prevent spamming/cost blowup
const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: { error: 'Too many requests to AI prompt services. Please wait a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api', aiRateLimiter, promptifyRoutes);
app.use('/api', aiRateLimiter, generateRoutes);
app.use('/api', historyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Promptify Backend',
    otelEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`[Promptify Server] Running on http://localhost:${PORT}`);
});

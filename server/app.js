const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoose = require('mongoose');

const env = require('./config/env');
const appInfo = require('./config/appInfo');
const { getDBState } = require('./config/database');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const requestIdMiddleware = require('./middleware/requestIdMiddleware');
const performanceMiddleware = require('./middleware/performanceMiddleware');
const { sanitizeNoSQL } = require('./middleware/sanitizerMiddleware');
const { authRateLimiter, uploadRateLimiter, communicationRateLimiter } = require('./middleware/rateLimitMiddleware');
const metricsService = require('./services/metricsService');
const { protect } = require('./middleware/authMiddleware');
const { authorize } = require('./middleware/roleMiddleware');

// Route modules
const authRoutes = require('./routes/authRoutes');
const founderRoutes = require('./routes/founderRoutes');
const startupRoutes = require('./routes/startupRoutes');
const investorRoutes = require('./routes/investorRoutes');
const connectionRoutes = require('./routes/connectionRoutes');
const shortlistRoutes = require('./routes/shortlistRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const pipelineRoutes = require('./routes/pipelineRoutes');
const dealRoutes = require('./routes/dealRoutes');
const investmentRoutes = require('./routes/investmentRoutes');
const portfolioUpdateRoutes = require('./routes/portfolioUpdateRoutes');
const portfolioPerformanceRoutes = require('./routes/portfolioPerformanceRoutes');
const followOnInvestmentRoutes = require('./routes/followOnInvestmentRoutes');
const ownershipEventRoutes = require('./routes/ownershipEventRoutes');
const portfolioIntelligenceRoutes = require('./routes/portfolioIntelligenceRoutes');
const exitRoutes = require('./routes/exitRoutes');
const investorStrategyRoutes = require('./routes/investorStrategyRoutes');
const capitalAllocationRoutes = require('./routes/capitalAllocationRoutes');
const investmentDecisionRoutes = require('./routes/investmentDecisionRoutes');
const opportunityRankingRoutes = require('./routes/opportunityRankingRoutes');
const portfolioScenarioRoutes = require('./routes/portfolioScenarioRoutes');
const portfolioStrategyRoutes = require('./routes/portfolioStrategyRoutes');
const documentRoutes = require('./routes/documentRoutes');
const dueDiligenceRoutes = require('./routes/dueDiligenceRoutes');
const documentRequestRoutes = require('./routes/documentRequestRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const investorInterestRoutes = require('./routes/investorInterestRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const systemRoutes = require('./routes/systemRoutes');
const adminRoutes = require('./routes/adminRoutes');
const fundraisingRoutes = require('./routes/fundraisingRoutes');
const closingRoutes = require('./routes/closingRoutes');
const governanceRoutes = require('./routes/governanceRoutes');

const app = express();

// Correlation Request Tracing Header Middleware
app.use(requestIdMiddleware);

// Production Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS Configuration
const allowedOrigins = [env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else if (env.NODE_ENV !== 'production') {
        callback(null, true); // Dev fallback
      } else {
        callback(new Error('CORS policy error: Origin not allowed'));
      }
    },
    credentials: true,
  })
);

// Body & Cookie Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// NoSQL Parameter Sanitizer
app.use(sanitizeNoSQL);

// Performance & Operational Metrics Middleware
app.use(performanceMiddleware);
app.use((req, res, next) => {
  const startTime = Date.now();
  res.on('finish', () => {
    metricsService.recordRequest(res.statusCode, Date.now() - startTime);
  });
  next();
});

// Liveness Probe Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Ventriva API service operational',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// Database & Application Readiness Probe Endpoint
app.get('/api/health/ready', (req, res) => {
  const dbState = getDBState();
  if (dbState.isConnected) {
    return res.status(200).json({
      success: true,
      data: {
        application: 'ready',
        database: 'ready',
      },
    });
  }
  return res.status(503).json({
    success: false,
    data: {
      application: 'ready',
      database: 'disconnected',
    },
  });
});

// Application Version & Build Metadata Endpoint
app.get('/api/health/version', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      name: appInfo.name,
      version: appInfo.version,
      environment: appInfo.environment,
      build: appInfo.buildId,
    },
  });
});

// Admin-Only Detailed Health Diagnostic Endpoint
app.get('/api/health/detailed', protect, authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      appInfo,
      database: getDBState(),
      process: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
      },
    },
  });
});

// API Routes Architecture with Security Rate Limiters
app.use('/api/auth', authRoutes);
app.use('/api/founders', founderRoutes);
app.use('/api/startups', startupRoutes);
app.use('/api/investors', investorRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/shortlists', shortlistRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/pipelines', pipelineRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/portfolio-updates', portfolioUpdateRoutes);
app.use('/api/portfolio-performance', portfolioPerformanceRoutes);
app.use('/api/follow-on-investments', followOnInvestmentRoutes);
app.use('/api/ownership-events', ownershipEventRoutes);
app.use('/api/portfolio-intelligence', portfolioIntelligenceRoutes);
app.use('/api/exits', exitRoutes);
app.use('/api/investor-strategy', investorStrategyRoutes);
app.use('/api/capital-allocations', capitalAllocationRoutes);
app.use('/api/investment-decisions', investmentDecisionRoutes);
app.use('/api/opportunities', opportunityRankingRoutes);
app.use('/api/portfolio-scenarios', portfolioScenarioRoutes);
app.use('/api/portfolio-strategy', portfolioStrategyRoutes);
app.use('/api/documents', uploadRateLimiter, documentRoutes);
app.use('/api/due-diligence', dueDiligenceRoutes);
app.use('/api/document-requests', documentRequestRoutes);
app.use('/api/conversations', communicationRateLimiter, conversationRoutes);
app.use('/api/messages', communicationRateLimiter, messageRoutes);
const actionRoutes = require('./routes/actionRoutes');

app.use('/api/actions', actionRoutes);
app.use('/api/interests', communicationRateLimiter, investorInterestRoutes);
app.use('/api/meetings', communicationRateLimiter, meetingRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin/system', systemRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', fundraisingRoutes);
app.use('/api', closingRoutes);
app.use('/api', governanceRoutes);

// Fallback & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

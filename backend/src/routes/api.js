/**
 * API Routes
 * Defines all API endpoints with multi-provider support
 */

const express = require('express');
const router = express.Router();
const providerService = require('../services/provider.service');
const { validateAssessRequest, validateBody } = require('../middleware/validator');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * POST /api/assess
 * Process field report and return threat assessment
 */
router.post('/assess', validateBody, validateAssessRequest, asyncHandler(async (req, res) => {
  const { report, metadata, providerConfig } = req.body;
  
  console.log('Processing assessment request:', {
    reportLength: Array.isArray(report) ? report.length + ' reports' : report.length,
    provider: providerConfig?.provider || 'ollama',
    hasMetadata: !!metadata
  });

  const startTime = Date.now();

  try {
    const assessment = await providerService.generateAssessment(report, providerConfig || {}, metadata);
    const processingTime = Date.now() - startTime;

    console.log('Assessment completed:', {
      threatLevel: assessment.threatLevel,
      confidence: assessment.confidence,
      processingTime: `${processingTime}ms`
    });

    res.json({
      success: true,
      data: {
        assessment,
        processingTime
      }
    });

  } catch (error) {
    console.error('Assessment failed:', error.message);
    throw error;
  }
}));

/**
 * GET /api/models?provider=ollama|lmstudio|openrouter|sarvam
 * List available models for specified provider
 */
router.get('/models', asyncHandler(async (req, res) => {
  const provider = req.query.provider || 'ollama';
  const providerConfig = req.query;

  try {
    const models = await providerService.listModels({ provider, ...providerConfig });

    res.json({
      success: true,
      data: {
        provider,
        models
      }
    });

  } catch (error) {
    console.error('Failed to list models:', error.message);
    
    res.status(503).json({
      success: false,
      error: 'Unable to fetch models',
      details: error.message
    });
  }
}));

/**
 * POST /api/health
 * Check provider connectivity with config
 */
router.post('/api/health', validateBody, asyncHandler(async (req, res) => {
  const { providerConfig } = req.body;

  const status = await providerService.checkConnection(providerConfig || { provider: 'ollama' });

  res.json({
    success: status.connected,
    data: {
      provider: providerConfig?.provider || 'ollama',
      ...status,
      timestamp: new Date().toISOString()
    }
  });
}));

/**
 * GET /api/health
 * Quick health check (legacy endpoint)
 */
router.get('/health', asyncHandler(async (req, res) => {
  const ollamaStatus = await providerService.checkConnection({ provider: 'ollama' });

  res.json({
    success: ollamaStatus.connected,
    data: {
      backend: 'operational',
      ollama: ollamaStatus,
      timestamp: new Date().toISOString()
    }
  });
}));

/**
 * GET /api/status
 * Quick status check (lightweight)
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'online',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }
  });
});

module.exports = router;

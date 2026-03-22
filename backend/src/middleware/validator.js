/**
 * Input Validation Middleware
 * Validates and sanitizes user inputs
 */

const config = require('../config/ollama.config');

/**
 * Sanitize HTML and script tags from input
 * @param {string} input - Raw input string
 * @returns {string} - Sanitized string
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Remove script-related patterns
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  return sanitized.trim();
}

/**
 * Validate report assessment request
 */
function validateAssessRequest(req, res, next) {
  const { report, metadata, model } = req.body;

  // Validate report field
  if (!report) {
    return res.status(400).json({
      success: false,
      error: 'Report field is required'
    });
  }

  if (typeof report !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Report must be a string'
    });
  }

  const sanitizedReport = sanitizeInput(report);

  if (sanitizedReport.length < config.minInputLength) {
    return res.status(400).json({
      success: false,
      error: `Report must be at least ${config.minInputLength} characters`
    });
  }

  if (sanitizedReport.length > config.maxInputLength) {
    return res.status(400).json({
      success: false,
      error: `Report must not exceed ${config.maxInputLength} characters`
    });
  }

  // Sanitize report
  req.body.report = sanitizedReport;

  // Validate and sanitize metadata if present
  if (metadata) {
    if (typeof metadata !== 'object' || Array.isArray(metadata)) {
      return res.status(400).json({
        success: false,
        error: 'Metadata must be an object'
      });
    }

    const sanitizedMetadata = {};
    
    if (metadata.location) {
      sanitizedMetadata.location = sanitizeInput(metadata.location);
    }
    
    if (metadata.reporterId) {
      sanitizedMetadata.reporterId = sanitizeInput(metadata.reporterId);
    }
    
    if (metadata.priority) {
      const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      if (validPriorities.includes(metadata.priority)) {
        sanitizedMetadata.priority = metadata.priority;
      }
    }

    req.body.metadata = sanitizedMetadata;
  }

  // Validate model if present
  if (model) {
    if (typeof model !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Model must be a string'
      });
    }

    req.body.model = sanitizeInput(model);
  }

  next();
}

/**
 * Validate request body exists
 */
function validateBody(req, res, next) {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Request body is required'
    });
  }
  next();
}

/**
 * Rate limiting (simple in-memory implementation)
 */
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100;

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }

  const record = requestCounts.get(ip);
  
  if (now > record.resetTime) {
    // Reset counter
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW;
    return next();
  }

  if (record.count >= MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.'
    });
  }

  record.count++;
  next();
}

// Clean up old rate limit records periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW);

module.exports = {
  sanitizeInput,
  validateAssessRequest,
  validateBody,
  rateLimit
};

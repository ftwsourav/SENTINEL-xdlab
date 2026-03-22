require('dotenv').config();

module.exports = {
  ollamaUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
  defaultModel: process.env.OLLAMA_DEFAULT_MODEL || 'phi3:mini',
  timeout: 120000, // 120 seconds (2 minutes) for CPU inference
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  maxInputLength: 10000,
  minInputLength: 10
};

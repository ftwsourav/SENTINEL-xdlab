/**
 * Multi-Provider Service
 * Supports Ollama, LM Studio, OpenRouter, and Sarvam AI
 */

const config = require('../config/ollama.config');
const promptService = require('./prompt.service');

class ProviderService {
  constructor() {
    this.timeout = config.timeout;
  }

  /**
   * Generate assessment using configured provider
   */
  async generateAssessment(report, providerConfig, metadata = {}) {
    const provider = providerConfig.provider || 'ollama';
    
    try {
      let response;
      
      switch (provider) {
        case 'ollama':
          response = await this.callOllama(report, providerConfig, metadata);
          break;
        case 'lmstudio':
          response = await this.callLMStudio(report, providerConfig, metadata);
          break;
        case 'openrouter':
          response = await this.callOpenRouter(report, providerConfig, metadata);
          break;
        case 'sarvam':
          response = await this.callSarvam(report, providerConfig, metadata);
          break;
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }

      const assessment = promptService.parseResponse(response);
      assessment.rawResponse = response;
      return assessment;

    } catch (error) {
      console.error(`${provider} assessment failed:`, error.message);
      return promptService.createFallbackAssessment(report, error.message);
    }
  }

  /**
   * Call Ollama API
   */
  async callOllama(report, providerConfig, metadata) {
    const baseUrl = providerConfig.url || 'http://localhost:11434';
    const model = providerConfig.model || 'phi3:mini';
    const prompt = promptService.buildPrompt(report, metadata);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature: providerConfig.temperature || 0.3,
            num_predict: providerConfig.maxTokens || 1024
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response;

    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Call LM Studio API (OpenAI-compatible)
   */
  async callLMStudio(report, providerConfig, metadata) {
    const baseUrl = providerConfig.url || 'http://localhost:1234';
    const model = providerConfig.model || 'local-model';
    const prompt = promptService.buildPrompt(report, metadata);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are SENTINEL, a tactical intelligence analyst.' },
            { role: 'user', content: prompt }
          ],
          temperature: providerConfig.temperature || 0.3,
          max_tokens: providerConfig.maxTokens || 1024
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`LM Studio API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;

    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Call OpenRouter API
   */
  async callOpenRouter(report, providerConfig, metadata) {
    const baseUrl = 'https://openrouter.ai/api/v1';
    const model = providerConfig.model || 'mistralai/mistral-7b-instruct';
    const apiKey = providerConfig.apiKey;

    if (!apiKey) {
      throw new Error('OpenRouter API key required');
    }

    const prompt = promptService.buildPrompt(report, metadata);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://sentinel.xdlab.ai',
          'X-Title': 'SENTINEL'
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are SENTINEL, a tactical intelligence analyst.' },
            { role: 'user', content: prompt }
          ],
          temperature: providerConfig.temperature || 0.3,
          max_tokens: providerConfig.maxTokens || 1024
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;

    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Call Sarvam AI API
   */
  async callSarvam(report, providerConfig, metadata) {
    const baseUrl = 'https://api.sarvam.ai';
    const model = providerConfig.model || 'sarvam-1';
    const apiKey = providerConfig.apiKey;

    if (!apiKey) {
      throw new Error('Sarvam AI API key required');
    }

    const prompt = promptService.buildPrompt(report, metadata);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are SENTINEL, a tactical intelligence analyst.' },
            { role: 'user', content: prompt }
          ],
          temperature: providerConfig.temperature || 0.3,
          max_tokens: providerConfig.maxTokens || 1024
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Sarvam AI error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;

    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Check provider connectivity
   */
  async checkConnection(providerConfig) {
    const provider = providerConfig.provider || 'ollama';

    try {
      switch (provider) {
        case 'ollama':
          return await this.checkOllama(providerConfig);
        case 'lmstudio':
          return await this.checkLMStudio(providerConfig);
        case 'openrouter':
          return await this.checkOpenRouter(providerConfig);
        case 'sarvam':
          return await this.checkSarvam(providerConfig);
        default:
          return { connected: false, error: 'Unknown provider' };
      }
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }

  async checkOllama(providerConfig) {
    const baseUrl = providerConfig.url || 'http://localhost:11434';
    
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${baseUrl}/api/tags`, {
        method: 'GET',
        signal: controller.signal
      });

      if (!response.ok) {
        return { connected: false, error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      return {
        connected: true,
        models: data.models?.map(m => m.name) || []
      };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }

  async checkLMStudio(providerConfig) {
    const baseUrl = providerConfig.url || 'http://localhost:1234';
    
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${baseUrl}/v1/models`, {
        method: 'GET',
        signal: controller.signal
      });

      if (!response.ok) {
        return { connected: false, error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      return {
        connected: true,
        models: data.data?.map(m => m.id) || []
      };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }

  async checkOpenRouter(providerConfig) {
    const apiKey = providerConfig.apiKey;
    
    if (!apiKey) {
      return { connected: false, error: 'API key required' };
    }

    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5000);

      const response = await fetch('https://openrouter.ai/api/v1/models', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` },
        signal: controller.signal
      });

      if (!response.ok) {
        return { connected: false, error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      return {
        connected: true,
        models: data.data?.map(m => m.id) || []
      };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }

  async checkSarvam(providerConfig) {
    const apiKey = providerConfig.apiKey;
    
    if (!apiKey) {
      return { connected: false, error: 'API key required' };
    }

    // Sarvam doesn't have a models endpoint, just verify API key format
    return {
      connected: true,
      models: ['sarvam-1', 'sarvam-2']
    };
  }

  /**
   * List models for provider
   */
  async listModels(providerConfig) {
    const status = await this.checkConnection(providerConfig);
    return status.models || [];
  }
}

module.exports = new ProviderService();

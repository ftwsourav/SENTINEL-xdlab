/**
 * Ollama Service
 * Handles communication with local Ollama instance
 */

const config = require('../config/ollama.config');
const promptService = require('./prompt.service');

class OllamaService {
  constructor() {
    this.baseUrl = config.ollamaUrl;
    this.defaultModel = config.defaultModel;
  }

  /**
   * Generate threat assessment from field report
   * @param {string} report - Field report text
   * @param {string} model - Model name (optional)
   * @param {object} metadata - Report metadata (optional)
   * @returns {Promise<object>} - Threat assessment
   */
  async generateAssessment(report, model = null, metadata = {}) {
    const modelName = model || this.defaultModel;
    const prompt = promptService.buildPrompt(report, metadata);

    try {
      const response = await this.callOllama(prompt, modelName);
      const assessment = promptService.parseResponse(response);
      
      // Add raw response for debugging
      assessment.rawResponse = response;
      
      return assessment;
    } catch (error) {
      console.error('Assessment generation failed:', error.message);
      
      // Return fallback assessment
      return promptService.createFallbackAssessment(report, error.message);
    }
  }

  /**
   * Call Ollama API with retry logic
   * @param {string} prompt - Prompt text
   * @param {string} model - Model name
   * @returns {Promise<string>} - Model response
   */
  async callOllama(prompt, model) {
    let lastError;

    for (let attempt = 1; attempt <= config.retryAttempts; attempt++) {
      try {
        console.log(`Ollama call attempt ${attempt}/${config.retryAttempts}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);

        const response = await fetch(`${this.baseUrl}/api/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            prompt: prompt,
            stream: false,
            options: {
              temperature: 0.7,
              top_p: 0.9,
              top_k: 40
            }
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.response) {
          throw new Error('No response from Ollama');
        }

        console.log('Ollama call successful');
        return data.response;

      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt} failed:`, error.message);

        if (attempt < config.retryAttempts) {
          const delay = config.retryDelay * attempt; // Exponential backoff
          console.log(`Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    throw new Error(`Ollama call failed after ${config.retryAttempts} attempts: ${lastError.message}`);
  }

  /**
   * Check Ollama connection and model availability
   * @returns {Promise<object>} - Connection status
   */
  async checkConnection() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          status: 'error',
          message: `Ollama API returned ${response.status}`,
          connected: false
        };
      }

      const data = await response.json();
      const models = data.models || [];
      const modelNames = models.map(m => m.name);
      const hasDefaultModel = modelNames.includes(this.defaultModel);

      return {
        status: 'connected',
        connected: true,
        models: modelNames,
        defaultModel: this.defaultModel,
        defaultModelAvailable: hasDefaultModel
      };

    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        connected: false
      };
    }
  }

  /**
   * List available Ollama models
   * @returns {Promise<array>} - List of model names
   */
  async listModels() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }

      const data = await response.json();
      return data.models || [];

    } catch (error) {
      console.error('Failed to list models:', error.message);
      throw error;
    }
  }

  /**
   * Sleep utility for retry delays
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Stream response from Ollama (for future real-time updates)
   * @param {string} prompt - Prompt text
   * @param {string} model - Model name
   * @param {function} onChunk - Callback for each chunk
   * @returns {Promise<string>} - Complete response
   */
  async streamResponse(prompt, model, onChunk) {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.response) {
              fullResponse += data.response;
              if (onChunk) {
                onChunk(data.response);
              }
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }

      return fullResponse;

    } catch (error) {
      console.error('Stream error:', error.message);
      throw error;
    }
  }
}

module.exports = new OllamaService();

/**
 * API Service
 * Handles all backend API communication
 */

import { API_BASE_URL } from '../utils/constants';
import type { ThreatAssessment, ReportMetadata } from '../types/report.types';
import type { HealthStatus } from '../types/config.types';

interface AssessResponse {
  success: boolean;
  data?: {
    assessment: ThreatAssessment;
    processingTime: number;
  };
  error?: string;
}

interface ModelsResponse {
  success: boolean;
  data?: {
    models: string[];
    current: string;
    details: any[];
  };
  error?: string;
}

interface HealthResponse {
  success: boolean;
  data?: HealthStatus;
  error?: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Analyze field report and get threat assessment
   */
  async analyzeReport(
    report: string | any[],
    metadata?: ReportMetadata,
    providerConfig?: any
  ): Promise<ThreatAssessment> {
    try {
      const response = await fetch(`${this.baseUrl}/assess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          report,
          metadata,
          providerConfig
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: AssessResponse = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Assessment failed');
      }

      return data.data.assessment;

    } catch (error) {
      console.error('API Error - analyzeReport:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to analyze report');
    }
  }

  /**
   * Get list of available Ollama models
   */
  async getModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ModelsResponse = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to fetch models');
      }

      return data.data.models;

    } catch (error) {
      console.error('API Error - getModels:', error);
      // Return empty array instead of throwing to allow graceful degradation
      return [];
    }
  }

  /**
   * Check backend and Ollama health status
   */
  async checkHealth(): Promise<HealthStatus | null> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
      });

      const data: HealthResponse = await response.json();

      if (data.data) {
        return data.data;
      }

      return null;

    } catch (error) {
      console.error('API Error - checkHealth:', error);
      return null;
    }
  }

  /**
   * Quick status check (lightweight)
   */
  async checkStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/status`, {
        method: 'GET',
      });

      return response.ok;

    } catch (error) {
      return false;
    }
  }
}

export default new ApiService();

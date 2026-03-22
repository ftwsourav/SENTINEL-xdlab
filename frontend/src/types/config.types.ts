/**
 * Configuration Type Definitions
 */

export interface AppConfig {
  apiUrl: string;
  defaultModel: string;
}

export interface ModelInfo {
  name: string;
  size?: string;
  parameters?: string;
}

export interface OllamaStatus {
  status?: string;
  connected: boolean;
  models?: string[];
  defaultModel?: string;
  defaultModelAvailable?: boolean;
  message?: string;
  error?: string;
  responseTime?: number;
}

export interface HealthStatus {
  backend: string;
  timestamp: string;
  ollama: OllamaStatus;
}

export interface ExportOptions {
  format: 'JSON' | 'PDF';
  includeRawReport: boolean;
  includeAssessment: boolean;
  includeMetadata: boolean;
  includeTimestamps: boolean;
}

/**
 * App Context
 * Global application state management
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Report, ThreatAssessment, ReportMetadata } from '../types/report.types';
import type { HealthStatus } from '../types/config.types';
import apiService from '../services/api.service';
import dbService from '../services/db.service';

interface AppSettings {
  provider: 'ollama' | 'lmstudio' | 'openrouter' | 'sarvam';
  ollamaUrl: string;
  lmstudioUrl: string;
  openrouterApiKey: string;
  sarvamApiKey: string;
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
}

interface AppContextType {
  // State
  currentReport: Report | null;
  reports: Report[];
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
  healthStatus: HealthStatus | null;
  availableModels: string[];
  currentView: string;

  // Actions
  analyzeReport: (report: string, metadata?: ReportMetadata, model?: string) => Promise<void>;
  loadReports: () => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  clearAllReports: () => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  checkHealth: () => Promise<void>;
  loadModels: () => Promise<void>;
  setCurrentView: (view: string) => void;
  setCurrentReport: (report: Report | null) => void;
  clearError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_SETTINGS: AppSettings = {
  provider: 'ollama',
  ollamaUrl: 'http://localhost:11434',
  lmstudioUrl: 'http://localhost:1234',
  openrouterApiKey: '',
  sarvamApiKey: '',
  defaultModel: 'phi3:mini',
  temperature: 0.3,
  maxTokens: 1024,
  timeout: 120
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState('analyze');

  // Initialize database and load data
  useEffect(() => {
    const initialize = async () => {
      try {
        await dbService.init();
        await loadReports();
        await loadSettings();
        await checkHealth();
        await loadModels();
      } catch (err) {
        console.error('Initialization error:', err);
        setError('Failed to initialize application');
      }
    };

    initialize();
  }, []);

  // Health check interval
  useEffect(() => {
    const interval = setInterval(() => {
      checkHealth();
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  /**
   * Load settings from database
   */
  const loadSettings = async () => {
    try {
      const savedSettings = await dbService.getSettings('app-settings');
      if (savedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...savedSettings });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  /**
   * Analyze field report
   */
  const analyzeReport = useCallback(async (
    reportText: string,
    metadata?: ReportMetadata,
    model?: string
  ) => {
    setIsLoading(true);
    setError(null);

    const report: Report = {
      id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      rawInput: reportText,
      metadata: metadata || {},
      status: 'PROCESSING'
    };

    try {
      // Save pending report
      await dbService.saveReport(report);
      setCurrentReport(report);

      // Build provider config
      const providerConfig = {
        provider: settings.provider,
        url: settings.provider === 'ollama' ? settings.ollamaUrl : settings.lmstudioUrl,
        apiKey: settings.provider === 'openrouter' ? settings.openrouterApiKey : settings.sarvamApiKey,
        model: model || settings.defaultModel,
        temperature: settings.temperature,
        maxTokens: settings.maxTokens
      };

      // Get assessment from backend
      const assessment = await apiService.analyzeReport(
        reportText,
        metadata,
        providerConfig
      );

      // Update report with assessment
      const completedReport: Report = {
        ...report,
        assessment,
        status: 'COMPLETED'
      };

      await dbService.saveReport(completedReport);
      setCurrentReport(completedReport);
      await loadReports();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);

      // Update report with error
      const errorReport: Report = {
        ...report,
        status: 'ERROR',
        error: errorMessage
      };

      await dbService.saveReport(errorReport);
      setCurrentReport(errorReport);
      await loadReports();

      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [settings.defaultModel]);

  /**
   * Load all reports from database
   */
  const loadReports = useCallback(async () => {
    try {
      const allReports = await dbService.getAllReports();
      setReports(allReports);
    } catch (err) {
      console.error('Failed to load reports:', err);
      setError('Failed to load report history');
    }
  }, []);

  /**
   * Delete a report
   */
  const deleteReport = useCallback(async (id: string) => {
    try {
      await dbService.deleteReport(id);
      await loadReports();
      if (currentReport?.id === id) {
        setCurrentReport(null);
      }
    } catch (err) {
      console.error('Failed to delete report:', err);
      setError('Failed to delete report');
    }
  }, [currentReport, loadReports]);

  /**
   * Clear all reports
   */
  const clearAllReports = useCallback(async () => {
    try {
      await dbService.clearAllReports();
      setReports([]);
      setCurrentReport(null);
    } catch (err) {
      console.error('Failed to clear reports:', err);
      setError('Failed to clear reports');
    }
  }, []);

  /**
   * Update settings
   */
  const updateSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    try {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      await dbService.saveSettings('app-settings', updated);
    } catch (err) {
      console.error('Failed to update settings:', err);
      setError('Failed to save settings');
    }
  }, [settings]);

  /**
   * Check backend and Ollama health
   */
  const checkHealth = useCallback(async () => {
    try {
      const health = await apiService.checkHealth();
      setHealthStatus(health);
    } catch (err) {
      console.error('Health check failed:', err);
      setHealthStatus(null);
    }
  }, []);

  /**
   * Load available models
   */
  const loadModels = useCallback(async () => {
    try {
      const models = await apiService.getModels();
      setAvailableModels(models);
    } catch (err) {
      console.error('Failed to load models:', err);
    }
  }, []);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AppContextType = {
    currentReport,
    reports,
    settings,
    isLoading,
    error,
    healthStatus,
    availableModels,
    currentView,
    analyzeReport,
    loadReports,
    deleteReport,
    clearAllReports,
    updateSettings,
    checkHealth,
    loadModels,
    setCurrentView,
    setCurrentReport,
    clearError
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

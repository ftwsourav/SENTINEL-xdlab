import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { ConfirmModal } from '../common/Modal';
import { toast } from '../common/Toast';
import exportService from '../../services/export.service';
import dbService from '../../services/db.service';
import './Settings.css';

const PROVIDER_OPTIONS = [
  { id: 'ollama', name: 'OLLAMA', subtitle: 'Local · Offline' },
  { id: 'lmstudio', name: 'LM STUDIO', subtitle: 'Local · OpenAI' },
  { id: 'openrouter', name: 'OPENROUTER', subtitle: 'Cloud · Free' },
  { id: 'sarvam', name: 'SARVAM AI', subtitle: 'Cloud · Indian' }
];

const DEFAULT_URLS: Record<string, string> = {
  ollama: 'http://localhost:11434',
  lmstudio: 'http://localhost:1234',
  openrouter: 'https://openrouter.ai/api/v1',
  sarvam: 'https://api.sarvam.ai'
};

const HARDCODED_MODELS: Record<string, string[]> = {
  openrouter: [
    'mistralai/mistral-7b-instruct',
    'meta-llama/llama-3-8b-instruct',
    'google/gemma-7b-it'
  ],
  sarvam: ['sarvam-m', 'sarvam-30b', 'sarvam-30b-16k', 'sarvam-105b', 'sarvam-105b-32k']
};

export const Settings: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    checkHealth,
    healthStatus,
    clearAllReports,
    reports
  } = useApp();

  const [provider, setProvider] = useState(settings.provider);
  const [ollamaUrl, setOllamaUrl] = useState(settings.ollamaUrl);
  const [lmstudioUrl, setLmstudioUrl] = useState(settings.lmstudioUrl);
  const [openrouterApiKey, setOpenrouterApiKey] = useState(settings.openrouterApiKey);
  const [sarvamApiKey, setSarvamApiKey] = useState(settings.sarvamApiKey);
  const [selectedModel, setSelectedModel] = useState(settings.defaultModel);
  const [temperature, setTemperature] = useState(0.1); // Default to 0.1
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{ success: boolean; message: string; time?: number } | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);

  // Initialize state from settings
  useEffect(() => {
    setProvider(settings.provider);
    
    // Validate and fix URLs - never allow model names in URL fields
    const validateUrl = (url: string, defaultUrl: string) => {
      if (!url || !url.startsWith('http')) {
        return defaultUrl;
      }
      return url;
    };

    setOllamaUrl(validateUrl(settings.ollamaUrl, DEFAULT_URLS.ollama));
    setLmstudioUrl(validateUrl(settings.lmstudioUrl, DEFAULT_URLS.lmstudio));
    setOpenrouterApiKey(settings.openrouterApiKey || '');
    setSarvamApiKey(settings.sarvamApiKey || '');
    
    // Model is separate from URL
    setSelectedModel(settings.defaultModel || 'phi3:mini');
    setTemperature(settings.temperature || 0.1);
  }, [settings]);

  // Auto-fetch models when provider changes
  useEffect(() => {
    handleProviderChange();
  }, [provider]);

  const handleProviderChange = async () => {
    setConnectionResult(null);
    
    // For cloud providers, use hardcoded models
    if (provider === 'openrouter') {
      setAvailableModels(HARDCODED_MODELS.openrouter);
      setSelectedModel(HARDCODED_MODELS.openrouter[0]);
      return;
    }

    if (provider === 'sarvam') {
      setAvailableModels(HARDCODED_MODELS.sarvam);
      setSelectedModel(HARDCODED_MODELS.sarvam[0]);
      return;
    }

    // For local providers, try to fetch models
    if (provider === 'ollama' || provider === 'lmstudio') {
      await fetchModels();
    }
  };

  const fetchModels = async () => {
    setIsFetchingModels(true);
    setAvailableModels([]);
    
    try {
      const url = provider === 'ollama' ? ollamaUrl : lmstudioUrl;
      
      // Validate URL before fetching
      if (!url.startsWith('http')) {
        toast.error('Invalid URL - must start with http:// or https://');
        setIsFetchingModels(false);
        return;
      }

      const response = await fetch(`http://localhost:3001/api/models?provider=${provider}&url=${encodeURIComponent(url)}`);
      const data = await response.json();

      if (data.success && data.data.models && data.data.models.length > 0) {
        setAvailableModels(data.data.models);
        if (!data.data.models.includes(selectedModel)) {
          setSelectedModel(data.data.models[0]);
        }
        toast.success(`Found ${data.data.models.length} models`);
      } else {
        toast.warning('No models found');
        setAvailableModels([]);
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
      toast.error('Failed to fetch models');
      setAvailableModels([]);
    } finally {
      setIsFetchingModels(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionResult(null);

    try {
      const providerConfig: any = { provider };

      if (provider === 'ollama') {
        if (!ollamaUrl.startsWith('http')) {
          toast.error('Invalid Ollama URL');
          setIsTestingConnection(false);
          return;
        }
        providerConfig.url = ollamaUrl;
      } else if (provider === 'lmstudio') {
        if (!lmstudioUrl.startsWith('http')) {
          toast.error('Invalid LM Studio URL');
          setIsTestingConnection(false);
          return;
        }
        providerConfig.url = lmstudioUrl;
      } else if (provider === 'openrouter') {
        if (!openrouterApiKey) {
          toast.error('OpenRouter API key required');
          setIsTestingConnection(false);
          return;
        }
        providerConfig.apiKey = openrouterApiKey;
      } else if (provider === 'sarvam') {
        if (!sarvamApiKey) {
          toast.error('Sarvam AI API key required');
          setIsTestingConnection(false);
          return;
        }
        providerConfig.apiKey = sarvamApiKey;
      }

      const startTime = Date.now();
      const response = await fetch('http://localhost:3001/api/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerConfig })
      });
      const responseTime = Date.now() - startTime;

      const data = await response.json();

      if (data.success && data.data.connected) {
        setConnectionResult({
          success: true,
          message: 'CONNECTED',
          time: responseTime
        });
        toast.success('Connection successful');
      } else {
        setConnectionResult({
          success: false,
          message: data.data.error || 'Connection failed'
        });
        toast.error('Connection failed');
      }
    } catch (error) {
      setConnectionResult({
        success: false,
        message: 'Connection refused'
      });
      toast.error('Connection failed');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSave = async () => {
    // Validate URLs before saving
    if (provider === 'ollama' && !ollamaUrl.startsWith('http')) {
      toast.error('Invalid URL — must start with http:// or https://');
      return;
    }
    if (provider === 'lmstudio' && !lmstudioUrl.startsWith('http')) {
      toast.error('Invalid URL — must start with http:// or https://');
      return;
    }

    await updateSettings({
      provider,
      ollamaUrl,
      lmstudioUrl,
      openrouterApiKey,
      sarvamApiKey,
      defaultModel: selectedModel,
      temperature
    });
    toast.success('Settings saved successfully');
  };

  const handleClearData = () => {
    setShowClearModal(true);
  };

  const confirmClearData = async () => {
    await clearAllReports();
    toast.success('All data cleared');
  };

  const handleExportAll = async () => {
    try {
      const data = await dbService.exportAllData();
      exportService.exportAllData(data);
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const needsApiKey = provider === 'openrouter' || provider === 'sarvam';
  const needsUrl = provider === 'ollama' || provider === 'lmstudio';
  
  const urlLabel = provider === 'ollama' ? 'OLLAMA URL' : 'LM STUDIO URL';
  const currentUrl = provider === 'ollama' ? ollamaUrl : lmstudioUrl;
  const setCurrentUrl = provider === 'ollama' ? setOllamaUrl : setLmstudioUrl;

  return (
    <div className="settings">
      <h2 className="settings-title">SETTINGS</h2>

      <Card title="AI PROVIDER CONFIGURATION">
        <div className="settings-form">
          {/* Provider Selection Cards */}
          <div className="form-group">
            <label className="form-label">SELECT AI PROVIDER</label>
            <div className="provider-cards">
              {PROVIDER_OPTIONS.map(option => (
                <button
                  key={option.id}
                  className={`provider-card ${provider === option.id ? 'provider-card-selected' : ''}`}
                  onClick={() => setProvider(option.id as any)}
                >
                  <div className="provider-card-radio">
                    {provider === option.id ? '◉' : '○'}
                  </div>
                  <div className="provider-card-content">
                    <div className="provider-card-name">{option.name}</div>
                    <div className="provider-card-subtitle">{option.subtitle}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="form-hint">
              Local providers recommended for air-gapped deployments
            </div>
          </div>

          {/* URL Field for Local Providers */}
          {needsUrl && (
            <div className="form-group">
              <label className="form-label">{urlLabel}</label>
              <input
                type="text"
                className="form-input"
                value={currentUrl}
                onChange={(e) => setCurrentUrl(e.target.value)}
                placeholder={DEFAULT_URLS[provider]}
              />
              <div className="form-hint">
                Base URL for {provider === 'ollama' ? 'Ollama' : 'LM Studio'} API
              </div>
            </div>
          )}

          {/* API Key Field for Cloud Providers */}
          {needsApiKey && (
            <div className="form-group">
              <label className="form-label">
                {provider === 'openrouter' ? 'OPENROUTER API KEY' : 'SARVAM AI API KEY'}
              </label>
              <input
                type="password"
                className="form-input"
                value={provider === 'openrouter' ? openrouterApiKey : sarvamApiKey}
                onChange={(e) => provider === 'openrouter' ? setOpenrouterApiKey(e.target.value) : setSarvamApiKey(e.target.value)}
                placeholder={provider === 'openrouter' ? 'sk-or-...' : 'sk_...'}
              />
              <div className="form-hint">
                Get your API key from {provider === 'openrouter' ? 'openrouter.ai' : 'sarvam.ai'}
              </div>
            </div>
          )}

          {/* Connection Test */}
          <div className="form-group">
            <label className="form-label">CONNECTION STATUS</label>
            <div className="connection-test">
              <Button
                variant="secondary"
                size="small"
                onClick={handleTestConnection}
                loading={isTestingConnection}
                disabled={isTestingConnection}
              >
                {isTestingConnection ? 'TESTING...' : 'TEST CONNECTION'}
              </Button>
              {connectionResult && (
                <div className={`connection-result ${connectionResult.success ? 'connection-success' : 'connection-error'}`}>
                  {connectionResult.success ? '✓' : '✗'} {connectionResult.message}
                  {connectionResult.time && ` — ${connectionResult.time}ms`}
                </div>
              )}
            </div>
          </div>

          {/* Model Selection for Local Providers */}
          {needsUrl && (
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label">AVAILABLE MODELS</label>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={fetchModels}
                  loading={isFetchingModels}
                  disabled={isFetchingModels}
                >
                  {isFetchingModels ? 'SCANNING...' : 'FETCH MODELS'}
                </Button>
              </div>
              <select
                className="form-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={availableModels.length === 0}
              >
                {availableModels.length > 0 ? (
                  availableModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))
                ) : (
                  <option value={selectedModel}>{selectedModel}</option>
                )}
              </select>
              <div className="form-hint">
                {availableModels.length > 0 ? `${availableModels.length} models available` : 'Click FETCH MODELS to scan'}
              </div>
            </div>
          )}

          {/* Model Selection for Cloud Providers */}
          {needsApiKey && (
            <div className="form-group">
              <label className="form-label">ACTIVE MODEL</label>
              <select
                className="form-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                {availableModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
              <div className="form-hint">
                {availableModels.length} models available
              </div>
            </div>
          )}

          {/* Temperature Slider */}
          <div className="form-group">
            <label className="form-label">TEMPERATURE: {temperature.toFixed(1)}</label>
            <input
              type="range"
              className="form-range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
            />
            <div className="form-hint">
              Lower = more focused and consistent (recommended: 0.1-0.3 for structured output)
            </div>
          </div>

          <Button variant="primary" onClick={handleSave}>
            SAVE SETTINGS
          </Button>
        </div>
      </Card>

      <Card title="DATA MANAGEMENT">
        <div className="settings-form">
          <div className="data-stats">
            <div className="data-stat">
              <span className="data-stat-label">TOTAL REPORTS</span>
              <span className="data-stat-value">{reports.length}</span>
            </div>
          </div>

          <div className="data-actions">
            <Button variant="secondary" onClick={handleExportAll}>
              EXPORT ALL DATA
            </Button>
            <Button variant="danger" onClick={handleClearData}>
              CLEAR ALL DATA
            </Button>
          </div>
        </div>
      </Card>

      <Card title="ABOUT">
        <div className="about-section">
          <div className="about-item">
            <span className="about-label">VERSION</span>
            <span className="about-value">1.0.0</span>
          </div>
          <div className="about-item">
            <span className="about-label">PROJECT</span>
            <span className="about-value">SENTINEL - Tactical AI Intelligence Synthesizer</span>
          </div>
          <div className="about-item">
            <span className="about-label">ORGANIZATION</span>
            <span className="about-value">xDLab</span>
          </div>
          <div className="about-item">
            <span className="about-label">GRANT</span>
            <span className="about-value">iDEX Defence Challenge</span>
          </div>
        </div>
      </Card>

      <ConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={confirmClearData}
        title="CLEAR ALL DATA"
        message={`Delete all ${reports.length} reports? This action cannot be undone.`}
        confirmText="DELETE ALL"
        variant="danger"
      />
    </div>
  );
};

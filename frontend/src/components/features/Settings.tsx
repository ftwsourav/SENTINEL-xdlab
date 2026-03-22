import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { ConfirmModal } from '../common/Modal';
import { toast } from '../common/Toast';
import exportService from '../../services/export.service';
import dbService from '../../services/db.service';
import './Settings.css';

export const Settings: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    availableModels, 
    loadModels, 
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
  const [temperature, setTemperature] = useState(settings.temperature);
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    setProvider(settings.provider);
    setOllamaUrl(settings.ollamaUrl);
    setLmstudioUrl(settings.lmstudioUrl);
    setOpenrouterApiKey(settings.openrouterApiKey);
    setSarvamApiKey(settings.sarvamApiKey);
    setSelectedModel(settings.defaultModel);
    setTemperature(settings.temperature);
  }, [settings]);

  const handleSave = async () => {
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

  const handleTestConnection = async () => {
    toast.info('Testing connection...');
    await checkHealth();
    await loadModels();
    if (healthStatus?.ollama?.connected) {
      toast.success('Connection successful');
    } else {
      toast.error('Connection failed');
    }
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

  const isConnected = healthStatus?.ollama?.connected || false;

  return (
    <div className="settings">
      <h2 className="settings-title">SETTINGS</h2>

      <Card title="AI PROVIDER CONFIGURATION">
        <div className="settings-form">
          <div className="form-group">
            <label className="form-label">AI PROVIDER</label>
            <select
              className="form-select"
              value={provider}
              onChange={(e) => setProvider(e.target.value as any)}
            >
              <option value="ollama">Ollama (Local)</option>
              <option value="lmstudio">LM Studio (Local)</option>
              <option value="openrouter">OpenRouter (Cloud)</option>
              <option value="sarvam">Sarvam AI (Cloud)</option>
            </select>
            <div className="form-hint">
              Local providers are recommended for air-gapped deployments
            </div>
          </div>

          {provider === 'ollama' && (
            <>
              <div className="form-group">
                <label className="form-label">CONNECTION STATUS</label>
                <div className="connection-status">
                  <span className={`status-indicator ${isConnected ? 'status-connected' : 'status-disconnected'}`}>
                    {isConnected ? '● CONNECTED' : '● DISCONNECTED'}
                  </span>
                  <Button variant="secondary" size="small" onClick={handleTestConnection}>
                    TEST CONNECTION
                  </Button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">OLLAMA URL</label>
                <input
                  type="text"
                  className="form-input"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                />
              </div>
            </>
          )}

          {provider === 'lmstudio' && (
            <div className="form-group">
              <label className="form-label">LM STUDIO URL</label>
              <input
                type="text"
                className="form-input"
                value={lmstudioUrl}
                onChange={(e) => setLmstudioUrl(e.target.value)}
                placeholder="http://localhost:1234"
              />
              <div className="form-hint">
                Ensure LM Studio server is running
              </div>
            </div>
          )}

          {provider === 'openrouter' && (
            <div className="form-group">
              <label className="form-label">OPENROUTER API KEY</label>
              <input
                type="password"
                className="form-input"
                value={openrouterApiKey}
                onChange={(e) => setOpenrouterApiKey(e.target.value)}
                placeholder="sk-or-..."
              />
              <div className="form-hint">
                Get your API key from openrouter.ai
              </div>
            </div>
          )}

          {provider === 'sarvam' && (
            <div className="form-group">
              <label className="form-label">SARVAM AI API KEY</label>
              <input
                type="password"
                className="form-input"
                value={sarvamApiKey}
                onChange={(e) => setSarvamApiKey(e.target.value)}
                placeholder="sarvam-..."
              />
              <div className="form-hint">
                Get your API key from sarvam.ai
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">ACTIVE MODEL</label>
            <select
              className="form-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
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
              {availableModels.length} models available
            </div>
          </div>

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
              Lower = more focused, Higher = more creative
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

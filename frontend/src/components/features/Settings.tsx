import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
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

  const [ollamaUrl, setOllamaUrl] = useState(settings.ollamaUrl);
  const [selectedModel, setSelectedModel] = useState(settings.defaultModel);
  const [temperature, setTemperature] = useState(settings.temperature);

  useEffect(() => {
    setOllamaUrl(settings.ollamaUrl);
    setSelectedModel(settings.defaultModel);
    setTemperature(settings.temperature);
  }, [settings]);

  const handleSave = async () => {
    await updateSettings({
      ollamaUrl,
      defaultModel: selectedModel,
      temperature
    });
    alert('Settings saved successfully');
  };

  const handleTestConnection = async () => {
    await checkHealth();
    await loadModels();
  };

  const handleClearData = () => {
    if (window.confirm(`Delete all ${reports.length} reports? This cannot be undone.`)) {
      clearAllReports();
      alert('All data cleared');
    }
  };

  const isConnected = healthStatus?.ollama?.connected || false;

  return (
    <div className="settings">
      <h2 className="settings-title">SETTINGS</h2>

      <Card title="OLLAMA CONFIGURATION">
        <div className="settings-form">
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

          <Button variant="danger" onClick={handleClearData}>
            CLEAR ALL DATA
          </Button>
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
    </div>
  );
};

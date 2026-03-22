import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { LoadingOverlay } from '../common/LoadingOverlay';
import { toast } from '../common/Toast';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { useKeyboard } from '../../hooks/useKeyboard';
import { MIN_REPORT_LENGTH, MAX_REPORT_LENGTH } from '../../utils/constants';
import './ReportInput.css';

const REPORT_TEMPLATES = [
  {
    id: 'patrol',
    name: 'Patrol Report',
    template: 'PATROL REPORT\nDate/Time: \nLocation: \nUnit: \nObservations: \nRecommendations: '
  },
  {
    id: 'incident',
    name: 'Incident Report',
    template: 'INCIDENT REPORT\nDate/Time: \nLocation: \nType: \nDescription: \nCasualties: \nImmediate Actions: '
  },
  {
    id: 'intelligence',
    name: 'Intelligence Report',
    template: 'INTELLIGENCE REPORT\nSource: \nReliability: \nInformation: \nAssessment: \nRecommendations: '
  },
  {
    id: 'sitrep',
    name: 'Situation Report',
    template: 'SITUATION REPORT\nDate/Time: \nLocation: \nFriendly Forces: \nEnemy Forces: \nTerrain: \nWeather: \nSituation: '
  }
];

export const ReportInput: React.FC = () => {
  const { analyzeReport, isLoading, error, clearError, settings } = useApp();
  const [report, setReport] = useState('');
  const [source, setSource] = useState('');
  const [location, setLocation] = useState('');
  const [unit, setUnit] = useState('');
  const [classification, setClassification] = useState('UNCLASSIFIED');
  const [threatLevel, setThreatLevel] = useState('UNKNOWN');
  const [showTemplates, setShowTemplates] = useState(false);

  const { isListening, transcript, isSupported, startListening, stopListening, resetTranscript } = useVoiceInput();

  // Add voice transcript to report
  useEffect(() => {
    if (transcript) {
      setReport(prev => prev + transcript);
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  const charCount = report.length;
  const isValid = charCount >= MIN_REPORT_LENGTH && charCount <= MAX_REPORT_LENGTH;

  const handleSubmit = async () => {
    if (!isValid || isLoading) return;

    try {
      clearError();
      await analyzeReport(report, {
        reporterId: source || undefined,
        location: location || undefined,
        priority: threatLevel !== 'UNKNOWN' ? threatLevel as any : undefined
      });
      toast.success('Analysis complete');
    } catch (err) {
      toast.error('Analysis failed');
    }
  };

  const handleClear = () => {
    setReport('');
    setSource('');
    setLocation('');
    setUnit('');
    setClassification('UNCLASSIFIED');
    setThreatLevel('UNKNOWN');
    clearError();
  };

  const handleTemplateSelect = (template: string) => {
    setReport(template);
    setShowTemplates(false);
    toast.info('Template loaded');
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
      toast.info('Voice input stopped');
    } else {
      startListening();
      toast.info('Voice input started - speak now');
    }
  };

  // Keyboard shortcuts
  useKeyboard([
    {
      key: 'Enter',
      ctrl: true,
      callback: () => {
        if (isValid && !isLoading) {
          handleSubmit();
        }
      }
    },
    {
      key: 'Escape',
      callback: handleClear
    }
  ]);

  return (
    <div className="report-input">
      <div className="report-input-header">
        <h2 className="report-input-title">NEW FIELD REPORT</h2>
        <div className="report-input-actions">
          <Button
            variant="ghost"
            size="small"
            onClick={() => setShowTemplates(!showTemplates)}
          >
            {showTemplates ? 'HIDE TEMPLATES' : 'LOAD TEMPLATE'}
          </Button>
          {isSupported && (
            <Button
              variant={isListening ? 'danger' : 'secondary'}
              size="small"
              onClick={handleVoiceToggle}
            >
              {isListening ? '● STOP VOICE' : '🎤 VOICE INPUT'}
            </Button>
          )}
        </div>
      </div>

      {showTemplates && (
        <div className="report-templates">
          {REPORT_TEMPLATES.map(template => (
            <button
              key={template.id}
              className="template-button"
              onClick={() => handleTemplateSelect(template.template)}
            >
              {template.name}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="report-input-error">
          <span className="error-icon">⚠</span>
          <span>{error}</span>
        </div>
      )}

      <div className="report-input-form">
        <div className="form-group">
          <label className="form-label">
            FIELD REPORT
            {isListening && <span className="voice-indicator"> ● LISTENING...</span>}
          </label>
          <textarea
            className="form-textarea"
            value={report}
            onChange={(e) => setReport(e.target.value)}
            placeholder="Enter field report details or use voice input..."
            disabled={isLoading}
            rows={12}
          />
          <div className="form-hint">
            {charCount} / {MAX_REPORT_LENGTH} characters
            {charCount < MIN_REPORT_LENGTH && ` (minimum ${MIN_REPORT_LENGTH})`}
            <span className="form-hint-shortcut">Ctrl+Enter to submit</span>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">SOURCE TAG</label>
            <input
              type="text"
              className="form-input"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. ALPHA-1"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">LOCATION</label>
            <input
              type="text"
              className="form-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Grid 42N 123456"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">UNIT DESIGNATION</label>
            <input
              type="text"
              className="form-input"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g. 2nd Battalion"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">CLASSIFICATION</label>
            <select
              className="form-select"
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
              disabled={isLoading}
            >
              <option value="UNCLASSIFIED">UNCLASSIFIED</option>
              <option value="RESTRICTED">RESTRICTED</option>
              <option value="CONFIDENTIAL">CONFIDENTIAL</option>
              <option value="SECRET">SECRET</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">INITIAL THREAT ASSESSMENT</label>
            <select
              className="form-select"
              value={threatLevel}
              onChange={(e) => setThreatLevel(e.target.value)}
              disabled={isLoading}
            >
              <option value="UNKNOWN">UNKNOWN</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">AI MODEL</label>
            <select
              className="form-select"
              value={settings.defaultModel}
              disabled={isLoading}
            >
              <option value={settings.defaultModel}>{settings.defaultModel}</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <Button
            variant="primary"
            size="large"
            onClick={handleSubmit}
            disabled={!isValid || isLoading}
            loading={isLoading}
          >
            {isLoading ? 'PROCESSING...' : 'ANALYZE THREAT'}
          </Button>
          <Button
            variant="secondary"
            size="large"
            onClick={handleClear}
            disabled={isLoading}
          >
            CLEAR
          </Button>
        </div>
      </div>

      {isLoading && <LoadingOverlay />}
    </div>
  );
};

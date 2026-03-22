import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { LoadingOverlay } from '../common/LoadingOverlay';
import { MIN_REPORT_LENGTH, MAX_REPORT_LENGTH } from '../../utils/constants';
import './ReportInput.css';

export const ReportInput: React.FC = () => {
  const { analyzeReport, isLoading, error, clearError, settings } = useApp();
  const [report, setReport] = useState('');
  const [source, setSource] = useState('');
  const [threatLevel, setThreatLevel] = useState('UNKNOWN');

  const charCount = report.length;
  const isValid = charCount >= MIN_REPORT_LENGTH && charCount <= MAX_REPORT_LENGTH;

  const handleSubmit = async () => {
    if (!isValid || isLoading) return;

    try {
      clearError();
      await analyzeReport(report, {
        reporterId: source || undefined,
        priority: threatLevel !== 'UNKNOWN' ? threatLevel as any : undefined
      });
    } catch (err) {
      // Error is handled by context
    }
  };

  const handleClear = () => {
    setReport('');
    setSource('');
    setThreatLevel('UNKNOWN');
    clearError();
  };

  return (
    <div className="report-input">
      <h2 className="report-input-title">NEW FIELD REPORT</h2>

      {error && (
        <div className="report-input-error">
          <span className="error-icon">⚠</span>
          <span>{error}</span>
        </div>
      )}

      <div className="report-input-form">
        <div className="form-group">
          <label className="form-label">FIELD REPORT</label>
          <textarea
            className="form-textarea"
            value={report}
            onChange={(e) => setReport(e.target.value)}
            placeholder="Enter field report details..."
            disabled={isLoading}
            rows={12}
          />
          <div className="form-hint">
            {charCount} / {MAX_REPORT_LENGTH} characters
            {charCount < MIN_REPORT_LENGTH && ` (minimum ${MIN_REPORT_LENGTH})`}
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
            <label className="form-label">THREAT LEVEL</label>
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

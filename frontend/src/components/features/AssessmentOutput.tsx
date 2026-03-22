import React from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { toast } from '../common/Toast';
import exportService from '../../services/export.service';
import './AssessmentOutput.css';

export const AssessmentOutput: React.FC = () => {
  const { currentReport, setCurrentView, setCurrentReport } = useApp();

  if (!currentReport || !currentReport.assessment) {
    return null;
  }

  const { assessment } = currentReport;
  const threatLevelLower = assessment.threatLevel.toLowerCase() as 'critical' | 'high' | 'medium' | 'low';
  const summary = assessment.executiveSummary || assessment.summary || '';

  const handleNewReport = () => {
    setCurrentReport(null);
    setCurrentView('analyze');
  };

  const handleExportJSON = () => {
    try {
      exportService.exportJSON(currentReport);
      toast.success('Report exported as JSON');
    } catch (error) {
      toast.error('Failed to export JSON');
    }
  };

  const handleExportPDF = async () => {
    try {
      toast.info('Generating PDF...');
      await exportService.exportPDF(currentReport);
      toast.success('Report exported as PDF');
    } catch (error) {
      toast.error('Failed to export PDF');
    }
  };

  return (
    <div className="assessment-output">
      <div className="assessment-header">
        <div className="assessment-header-left">
          <h2 className="assessment-title">THREAT ASSESSMENT</h2>
          <div className="threat-level-badge-large">
            <Badge variant={threatLevelLower}>{assessment.threatLevel}</Badge>
          </div>
        </div>
        <div className="assessment-header-right">
          <div className="assessment-confidence">
            <span className="confidence-label">CONFIDENCE</span>
            <span className={`confidence-value ${assessment.confidence > 75 ? 'confidence-high' : ''}`}>
              {assessment.confidence}%
            </span>
          </div>
          <div className="assessment-timestamp">
            {new Date(currentReport.timestamp).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="threat-bars">
        <div className="threat-bar" data-level={assessment.threatLevel}>
          <div className="threat-bar-fill"></div>
        </div>
      </div>

      <Card title="EXECUTIVE SUMMARY">
        <p className="assessment-summary">{summary}</p>
      </Card>

      {assessment.correlatedIndicators && assessment.correlatedIndicators.length > 0 && (
        <Card title="CORRELATED INDICATORS">
          <ul className="findings-list">
            {assessment.correlatedIndicators.map((indicator, idx) => (
              <li key={idx} className="finding-item correlated-item">
                <span className="finding-bullet">◆</span>
                <span>{indicator}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card title="KEY FINDINGS">
        <ul className="findings-list">
          {assessment.keyFindings.map((finding, idx) => (
            <li key={idx} className="finding-item">
              <span className="finding-bullet">▸</span>
              <span>{finding}</span>
            </li>
          ))}
        </ul>
      </Card>

      {assessment.threats && assessment.threats.length > 0 && (
        <Card title="IDENTIFIED THREATS">
          <div className="threats-grid">
            {assessment.threats.map((threat, idx) => (
              <div key={idx} className="threat-card">
                <div className="threat-header">
                  <span className="threat-type">{threat.type}</span>
                  <Badge variant={threat.severity.toLowerCase() as any}>
                    {threat.severity}
                  </Badge>
                </div>
                <p className="threat-description">{threat.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="RECOMMENDED ACTIONS">
        <div className="recommendations-list">
          {assessment.recommendations.map((rec, idx) => (
            <div key={idx} className="recommendation-item">
              <div className="recommendation-header">
                <span className="recommendation-option">OPTION {rec.option}</span>
                <span className={`recommendation-risk risk-${rec.risk.toLowerCase()}`}>
                  RISK: {rec.risk}
                </span>
              </div>
              <div className="recommendation-action">{rec.action}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="INTELLIGENCE TAGS">
        <div className="intelligence-section">
          {assessment.intelligence.entities.length > 0 && (
            <div className="intelligence-group">
              <span className="intelligence-label">ENTITIES:</span>
              <div className="intelligence-tags">
                {assessment.intelligence.entities.map((entity, idx) => (
                  <span key={idx} className="intelligence-tag">{entity}</span>
                ))}
              </div>
            </div>
          )}
          {assessment.intelligence.locations.length > 0 && (
            <div className="intelligence-group">
              <span className="intelligence-label">LOCATIONS:</span>
              <div className="intelligence-tags">
                {assessment.intelligence.locations.map((loc, idx) => (
                  <span key={idx} className="intelligence-tag">{loc}</span>
                ))}
              </div>
            </div>
          )}
          {assessment.intelligence.keywords.length > 0 && (
            <div className="intelligence-group">
              <span className="intelligence-label">KEYWORDS:</span>
              <div className="intelligence-tags">
                {assessment.intelligence.keywords.map((keyword, idx) => (
                  <span key={idx} className="intelligence-tag">{keyword}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="assessment-actions">
        <Button variant="primary" onClick={handleExportJSON}>
          EXPORT JSON
        </Button>
        <Button variant="secondary" onClick={handleExportPDF}>
          EXPORT PDF
        </Button>
        <Button variant="secondary" onClick={handleNewReport}>
          NEW REPORT
        </Button>
      </div>
    </div>
  );
};

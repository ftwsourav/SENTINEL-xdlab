/**
 * Comparison Component
 * Multi-report comparison and correlation analysis
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import type { Report } from '../../types/report.types';
import exportService from '../../services/export.service';
import './Comparison.css';

interface ComparisonProps {
  selectedReports: Report[];
  onClose: () => void;
}

export const Comparison: React.FC<ComparisonProps> = ({ selectedReports, onClose }) => {
  const { analyzeReport, isLoading } = useApp();
  const [correlationAnalysis, setCorrelationAnalysis] = useState<any>(null);

  // Calculate comparison analytics
  const analytics = useMemo(() => {
    const completedReports = selectedReports.filter(r => r.assessment);

    // Common threats
    const allThreats = completedReports.flatMap(r => 
      r.assessment?.threats?.map(t => t.type) || []
    );
    const threatCounts: Record<string, number> = {};
    allThreats.forEach(threat => {
      threatCounts[threat] = (threatCounts[threat] || 0) + 1;
    });
    const commonThreats = Object.entries(threatCounts)
      .filter(([_, count]) => count > 1)
      .map(([threat, count]) => ({ threat, count }))
      .sort((a, b) => b.count - a.count);

    // Common locations
    const allLocations = completedReports.flatMap(r =>
      r.assessment?.intelligence.locations || []
    );
    const locationCounts: Record<string, number> = {};
    allLocations.forEach(loc => {
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });
    const commonLocations = Object.entries(locationCounts)
      .filter(([_, count]) => count > 1)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count);

    // Common entities
    const allEntities = completedReports.flatMap(r =>
      r.assessment?.intelligence.entities || []
    );
    const entityCounts: Record<string, number> = {};
    allEntities.forEach(entity => {
      entityCounts[entity] = (entityCounts[entity] || 0) + 1;
    });
    const commonEntities = Object.entries(entityCounts)
      .filter(([_, count]) => count > 1)
      .map(([entity, count]) => ({ entity, count }))
      .sort((a, b) => b.count - a.count);

    // Threat level progression
    const threatProgression = completedReports.map(r => ({
      timestamp: r.timestamp,
      level: r.assessment?.threatLevel || 'UNKNOWN',
      confidence: r.assessment?.confidence || 0,
    })).sort((a, b) => a.timestamp - b.timestamp);

    // Average confidence
    const avgConfidence = completedReports.reduce((sum, r) => 
      sum + (r.assessment?.confidence || 0), 0
    ) / (completedReports.length || 1);

    return {
      commonThreats,
      commonLocations,
      commonEntities,
      threatProgression,
      avgConfidence,
    };
  }, [selectedReports]);

  const handleGenerateCorrelation = async () => {
    try {
      // Prepare multi-report data for backend
      const multiReportData = selectedReports.map(r => ({
        source: r.metadata.reporterId || 'Unknown',
        timestamp: new Date(r.timestamp).toISOString(),
        content: r.rawInput,
        threatLevel: r.assessment?.threatLevel,
      }));

      // This would call the backend with multi-report analysis
      // For now, we'll use the analytics we calculated
      setCorrelationAnalysis({
        summary: `Analysis of ${selectedReports.length} reports reveals ${analytics.commonThreats.length} common threat patterns.`,
        patterns: analytics.commonThreats.map(t => t.threat),
        locations: analytics.commonLocations.map(l => l.location),
        entities: analytics.commonEntities.map(e => e.entity),
      });
    } catch (error) {
      console.error('Correlation analysis failed:', error);
    }
  };

  const handleExport = () => {
    exportService.exportComparisonPDF(selectedReports, analytics);
  };

  return (
    <div className="comparison">
      <div className="comparison-header">
        <h2 className="comparison-title">MULTI-REPORT COMPARISON</h2>
        <div className="comparison-actions">
          <Button variant="secondary" size="small" onClick={handleExport}>
            EXPORT PDF
          </Button>
          <Button variant="ghost" size="small" onClick={onClose}>
            CLOSE
          </Button>
        </div>
      </div>

      <div className="comparison-summary">
        <span className="comparison-count">{selectedReports.length} REPORTS SELECTED</span>
        <span className="comparison-confidence">
          AVG CONFIDENCE: {analytics.avgConfidence.toFixed(1)}%
        </span>
      </div>

      {/* Selected Reports */}
      <Card title="SELECTED REPORTS">
        <div className="comparison-reports-grid">
          {selectedReports.map(report => (
            <div key={report.id} className="comparison-report-card">
              <div className="comparison-report-header">
                {report.assessment && (
                  <Badge variant={report.assessment.threatLevel.toLowerCase() as any}>
                    {report.assessment.threatLevel}
                  </Badge>
                )}
                <span className="comparison-report-time">
                  {new Date(report.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="comparison-report-summary">
                {report.assessment?.executiveSummary || report.assessment?.summary || 'No summary'}
              </div>
              {report.metadata.reporterId && (
                <div className="comparison-report-source">
                  SOURCE: {report.metadata.reporterId}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Threat Progression */}
      <Card title="THREAT LEVEL PROGRESSION">
        <div className="comparison-progression">
          {analytics.threatProgression.map((item, idx) => (
            <div key={idx} className="comparison-progression-item">
              <div className="comparison-progression-time">
                {new Date(item.timestamp).toLocaleString()}
              </div>
              <Badge variant={item.level.toLowerCase() as any}>{item.level}</Badge>
              <div className="comparison-progression-confidence">
                {item.confidence}% confidence
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Common Patterns */}
      {analytics.commonThreats.length > 0 && (
        <Card title="COMMON THREAT PATTERNS">
          <div className="comparison-patterns">
            {analytics.commonThreats.map((item, idx) => (
              <div key={idx} className="comparison-pattern-item">
                <span className="comparison-pattern-name">{item.threat}</span>
                <span className="comparison-pattern-count">
                  Appears in {item.count} reports
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Common Locations */}
      {analytics.commonLocations.length > 0 && (
        <Card title="COMMON LOCATIONS">
          <div className="comparison-patterns">
            {analytics.commonLocations.map((item, idx) => (
              <div key={idx} className="comparison-pattern-item">
                <span className="comparison-pattern-name">{item.location}</span>
                <span className="comparison-pattern-count">
                  Mentioned in {item.count} reports
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Common Entities */}
      {analytics.commonEntities.length > 0 && (
        <Card title="COMMON ENTITIES">
          <div className="comparison-patterns">
            {analytics.commonEntities.map((item, idx) => (
              <div key={idx} className="comparison-pattern-item">
                <span className="comparison-pattern-name">{item.entity}</span>
                <span className="comparison-pattern-count">
                  Identified in {item.count} reports
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* AI Correlation Analysis */}
      <Card title="AI CORRELATION ANALYSIS">
        {!correlationAnalysis ? (
          <div className="comparison-correlation-prompt">
            <p className="comparison-correlation-text">
              Generate AI-powered correlation analysis to identify patterns and connections across selected reports.
            </p>
            <Button
              variant="primary"
              onClick={handleGenerateCorrelation}
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'ANALYZING...' : 'GENERATE CORRELATION ANALYSIS'}
            </Button>
          </div>
        ) : (
          <div className="comparison-correlation-result">
            <p className="comparison-correlation-summary">{correlationAnalysis.summary}</p>
            {correlationAnalysis.patterns.length > 0 && (
              <div className="comparison-correlation-section">
                <h4>Identified Patterns:</h4>
                <ul>
                  {correlationAnalysis.patterns.map((pattern: string, idx: number) => (
                    <li key={idx}>{pattern}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

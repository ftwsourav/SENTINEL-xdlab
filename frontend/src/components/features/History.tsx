import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import './History.css';

export const History: React.FC = () => {
  const { reports, deleteReport, clearAllReports, setCurrentReport, setCurrentView } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('ALL');

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.rawInput.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterLevel === 'ALL' || 
      (report.assessment && report.assessment.threatLevel === filterLevel);
    return matchesSearch && matchesFilter;
  });

  const handleViewReport = (report: any) => {
    setCurrentReport(report);
    setCurrentView('analyze');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all reports? This cannot be undone.')) {
      clearAllReports();
    }
  };

  return (
    <div className="history">
      <div className="history-header">
        <h2 className="history-title">REPORT HISTORY</h2>
        <div className="history-stats">
          <span className="history-count">{reports.length} REPORTS</span>
        </div>
      </div>

      <div className="history-controls">
        <input
          type="text"
          className="history-search"
          placeholder="Search reports..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="history-filter"
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
        >
          <option value="ALL">ALL LEVELS</option>
          <option value="CRITICAL">CRITICAL</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>
        {reports.length > 0 && (
          <Button variant="danger" size="small" onClick={handleClearAll}>
            CLEAR ALL
          </Button>
        )}
      </div>

      {filteredReports.length === 0 ? (
        <div className="history-empty">
          <p>No reports found</p>
        </div>
      ) : (
        <div className="history-list">
          {filteredReports.map(report => (
            <Card key={report.id} className="history-card" interactive onClick={() => handleViewReport(report)}>
              <div className="history-card-header">
                <div className="history-card-left">
                  {report.assessment && (
                    <Badge variant={report.assessment.threatLevel.toLowerCase() as any}>
                      {report.assessment.threatLevel}
                    </Badge>
                  )}
                  {!report.assessment && (
                    <Badge variant={report.status.toLowerCase() as any}>
                      {report.status}
                    </Badge>
                  )}
                  <span className="history-card-timestamp">
                    {new Date(report.timestamp).toLocaleString()}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Delete this report?')) {
                      deleteReport(report.id);
                    }
                  }}
                >
                  DELETE
                </Button>
              </div>
              <div className="history-card-content">
                {report.assessment ? (
                  <p className="history-card-summary">{report.assessment.summary}</p>
                ) : (
                  <p className="history-card-summary">{report.rawInput.substring(0, 150)}...</p>
                )}
              </div>
              {report.metadata.reporterId && (
                <div className="history-card-meta">
                  SOURCE: {report.metadata.reporterId}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { ConfirmModal } from '../common/Modal';
import { Comparison } from './Comparison';
import { toast } from '../common/Toast';
import { useDebounce } from '../../hooks/useDebounce';
import './History.css';

export const History: React.FC = () => {
  const { reports, deleteReport, clearAllReports, setCurrentReport, setCurrentView } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [selectedReportIds, setSelectedReportIds] = useState<Set<string>>(new Set());
  const [showComparison, setShowComparison] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.rawInput.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (report.assessment?.executiveSummary || '').toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesFilter = filterLevel === 'ALL' || 
      (report.assessment && report.assessment.threatLevel === filterLevel);
    return matchesSearch && matchesFilter;
  });

  const handleViewReport = (report: any) => {
    setCurrentReport(report);
    setCurrentView('analyze');
  };

  const handleToggleSelect = (reportId: string) => {
    const newSelected = new Set(selectedReportIds);
    if (newSelected.has(reportId)) {
      newSelected.delete(reportId);
    } else {
      if (newSelected.size >= 5) {
        toast.warning('Maximum 5 reports can be compared');
        return;
      }
      newSelected.add(reportId);
    }
    setSelectedReportIds(newSelected);
  };

  const handleCompare = () => {
    if (selectedReportIds.size < 2) {
      toast.warning('Select at least 2 reports to compare');
      return;
    }
    setShowComparison(true);
  };

  const handleClearAll = () => {
    setShowClearModal(true);
  };

  const confirmClearAll = () => {
    clearAllReports();
    toast.success('All reports cleared');
  };

  const handleDeleteReport = (reportId: string) => {
    setReportToDelete(reportId);
  };

  const confirmDelete = () => {
    if (reportToDelete) {
      deleteReport(reportToDelete);
      toast.success('Report deleted');
      setReportToDelete(null);
    }
  };

  const selectedReports = reports.filter(r => selectedReportIds.has(r.id));

  if (showComparison) {
    return (
      <Comparison
        selectedReports={selectedReports}
        onClose={() => {
          setShowComparison(false);
          setSelectedReportIds(new Set());
        }}
      />
    );
  }

  return (
    <div className="history">
      <div className="history-header">
        <h2 className="history-title">REPORT HISTORY</h2>
        <div className="history-stats">
          <span className="history-count">{reports.length} REPORTS</span>
          {selectedReportIds.size > 0 && (
            <span className="history-selected">{selectedReportIds.size} SELECTED</span>
          )}
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
        {selectedReportIds.size >= 2 && (
          <Button variant="primary" size="small" onClick={handleCompare}>
            COMPARE ({selectedReportIds.size})
          </Button>
        )}
        {reports.length > 0 && (
          <Button variant="danger" size="small" onClick={handleClearAll}>
            CLEAR ALL
          </Button>
        )}
      </div>

      {filteredReports.length === 0 ? (
        <div className="history-empty">
          <p>No reports found</p>
          {searchTerm && <p className="history-empty-hint">Try adjusting your search or filters</p>}
        </div>
      ) : (
        <div className="history-list">
          {filteredReports.map(report => (
            <Card key={report.id} className="history-card" interactive onClick={() => handleViewReport(report)}>
              <div className="history-card-header">
                <div className="history-card-left">
                  <input
                    type="checkbox"
                    className="history-checkbox"
                    checked={selectedReportIds.has(report.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleToggleSelect(report.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
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
                    handleDeleteReport(report.id);
                  }}
                >
                  DELETE
                </Button>
              </div>
              <div className="history-card-content">
                {report.assessment ? (
                  <p className="history-card-summary">
                    {report.assessment.executiveSummary || report.assessment.summary}
                  </p>
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

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={confirmClearAll}
        title="CLEAR ALL REPORTS"
        message={`Are you sure you want to delete all ${reports.length} reports? This action cannot be undone.`}
        confirmText="DELETE ALL"
        variant="danger"
      />

      <ConfirmModal
        isOpen={reportToDelete !== null}
        onClose={() => setReportToDelete(null)}
        onConfirm={confirmDelete}
        title="DELETE REPORT"
        message="Are you sure you want to delete this report? This action cannot be undone."
        confirmText="DELETE"
        variant="danger"
      />
    </div>
  );
};

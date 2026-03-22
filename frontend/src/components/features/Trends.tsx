/**
 * Trends Component
 * Analytics dashboard with data visualization
 */

import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import exportService from '../../services/export.service';
import './Trends.css';

export const Trends: React.FC = () => {
  const { reports } = useApp();

  // Calculate analytics
  const analytics = useMemo(() => {
    const completedReports = reports.filter(r => r.status === 'COMPLETED' && r.assessment);

    // Threat level distribution
    const threatLevelCounts: Record<string, number> = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };

    completedReports.forEach(report => {
      if (report.assessment) {
        threatLevelCounts[report.assessment.threatLevel]++;
      }
    });

    // Timeline data (last 7 days)
    const timelineData: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      const dateStr = format(date, 'MM/dd');
      const dayReports = completedReports.filter(r => {
        const reportDate = startOfDay(new Date(r.timestamp));
        return reportDate.getTime() === date.getTime();
      });

      timelineData.push({
        date: dateStr,
        critical: dayReports.filter(r => r.assessment?.threatLevel === 'CRITICAL').length,
        high: dayReports.filter(r => r.assessment?.threatLevel === 'HIGH').length,
        medium: dayReports.filter(r => r.assessment?.threatLevel === 'MEDIUM').length,
        low: dayReports.filter(r => r.assessment?.threatLevel === 'LOW').length,
        total: dayReports.length,
      });
    }

    // Threat type distribution
    const threatTypeCounts: Record<string, number> = {};
    completedReports.forEach(report => {
      report.assessment?.threats?.forEach(threat => {
        threatTypeCounts[threat.type] = (threatTypeCounts[threat.type] || 0) + 1;
      });
    });

    // Average confidence by threat level
    const confidenceByLevel: Record<string, { sum: number; count: number }> = {
      CRITICAL: { sum: 0, count: 0 },
      HIGH: { sum: 0, count: 0 },
      MEDIUM: { sum: 0, count: 0 },
      LOW: { sum: 0, count: 0 },
    };

    completedReports.forEach(report => {
      if (report.assessment) {
        const level = report.assessment.threatLevel;
        confidenceByLevel[level].sum += report.assessment.confidence;
        confidenceByLevel[level].count++;
      }
    });

    // Recent activity
    const recentReports = completedReports.slice(0, 5);

    return {
      totalReports: reports.length,
      completedReports: completedReports.length,
      threatLevelCounts,
      timelineData,
      threatTypeCounts,
      confidenceByLevel,
      recentReports,
    };
  }, [reports]);

  const threatLevelPieData = [
    { name: 'CRITICAL', value: analytics.threatLevelCounts.CRITICAL, color: '#8b2a2a' },
    { name: 'HIGH', value: analytics.threatLevelCounts.HIGH, color: '#daa520' },
    { name: 'MEDIUM', value: analytics.threatLevelCounts.MEDIUM, color: '#8a7a3a' },
    { name: 'LOW', value: analytics.threatLevelCounts.LOW, color: '#2a6a4a' },
  ].filter(item => item.value > 0);

  const threatTypeBarData = Object.entries(analytics.threatTypeCounts).map(([type, count]) => ({
    type,
    count,
  }));

  const handleExportCSV = () => {
    exportService.exportCSV(reports);
  };

  return (
    <div className="trends">
      <div className="trends-header">
        <h2 className="trends-title">THREAT ANALYTICS</h2>
        <Button variant="secondary" size="small" onClick={handleExportCSV}>
          EXPORT CSV
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="trends-stats">
        <Card className="trends-stat-card">
          <div className="trends-stat-value">{analytics.totalReports}</div>
          <div className="trends-stat-label">TOTAL REPORTS</div>
        </Card>
        <Card className="trends-stat-card">
          <div className="trends-stat-value">{analytics.completedReports}</div>
          <div className="trends-stat-label">COMPLETED</div>
        </Card>
        <Card className="trends-stat-card">
          <div className="trends-stat-value">{analytics.threatLevelCounts.CRITICAL}</div>
          <div className="trends-stat-label">CRITICAL THREATS</div>
        </Card>
        <Card className="trends-stat-card">
          <div className="trends-stat-value">{analytics.threatLevelCounts.HIGH}</div>
          <div className="trends-stat-label">HIGH THREATS</div>
        </Card>
      </div>

      {/* Timeline Chart */}
      <Card title="THREAT TIMELINE (LAST 7 DAYS)">
        <div className="trends-chart">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  background: '#0d0d0d',
                  border: '1px solid #333',
                  color: '#e8e4d9',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="critical" stroke="#8b2a2a" strokeWidth={2} name="Critical" />
              <Line type="monotone" dataKey="high" stroke="#daa520" strokeWidth={2} name="High" />
              <Line type="monotone" dataKey="medium" stroke="#8a7a3a" strokeWidth={2} name="Medium" />
              <Line type="monotone" dataKey="low" stroke="#2a6a4a" strokeWidth={2} name="Low" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="trends-row">
        {/* Threat Level Distribution */}
        <Card title="THREAT LEVEL DISTRIBUTION" className="trends-chart-card">
          <div className="trends-chart">
            {threatLevelPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={threatLevelPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {threatLevelPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#0d0d0d',
                      border: '1px solid #333',
                      color: '#e8e4d9',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="trends-empty">No data available</div>
            )}
          </div>
        </Card>

        {/* Threat Type Distribution */}
        <Card title="THREAT TYPE DISTRIBUTION" className="trends-chart-card">
          <div className="trends-chart">
            {threatTypeBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={threatTypeBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="type" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      background: '#0d0d0d',
                      border: '1px solid #333',
                      color: '#e8e4d9',
                    }}
                  />
                  <Bar dataKey="count" fill="#b8964a" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="trends-empty">No data available</div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card title="RECENT ACTIVITY">
        {analytics.recentReports.length > 0 ? (
          <div className="trends-recent-list">
            {analytics.recentReports.map(report => (
              <div key={report.id} className="trends-recent-item">
                <div className="trends-recent-left">
                  {report.assessment && (
                    <Badge variant={report.assessment.threatLevel.toLowerCase() as any}>
                      {report.assessment.threatLevel}
                    </Badge>
                  )}
                  <span className="trends-recent-time">
                    {format(report.timestamp, 'MMM dd, HH:mm')}
                  </span>
                </div>
                <div className="trends-recent-summary">
                  {report.assessment?.executiveSummary || report.assessment?.summary || 'No summary'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="trends-empty">No recent activity</div>
        )}
      </Card>
    </div>
  );
};

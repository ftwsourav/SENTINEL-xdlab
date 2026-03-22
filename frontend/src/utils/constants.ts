/**
 * Application Constants
 */

export const API_BASE_URL = 'http://localhost:3001/api';

export const MIN_REPORT_LENGTH = 10;
export const MAX_REPORT_LENGTH = 10000;

export const THREAT_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
} as const;

export const THREAT_COLORS = {
  LOW: '#3a5a7a',
  MEDIUM: '#8a7a3a',
  HIGH: '#a84a3a',
  CRITICAL: '#8b2a2a'
} as const;

export const STATUS_COLORS = {
  PENDING: '#555555',
  PROCESSING: '#b8964a',
  COMPLETED: '#2a6a4a',
  ERROR: '#8b2a2a'
} as const;

export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

export const TIMEFRAMES = ['IMMEDIATE', 'SHORT_TERM', 'LONG_TERM'] as const;

export const THREAT_TYPES = [
  'PERSONNEL',
  'EQUIPMENT',
  'LOCATION',
  'ACTIVITY',
  'OTHER'
] as const;

export const VIEWS = {
  NEW_REPORT: 'new-report',
  ASSESSMENT: 'assessment',
  HISTORY: 'history',
  COMPARISON: 'comparison',
  TRENDS: 'trends',
  SETTINGS: 'settings'
} as const;

export const DB_NAME = 'sentinel-db';
export const DB_VERSION = 1;
export const REPORTS_STORE = 'reports';
export const CONFIG_STORE = 'config';

export const DEFAULT_EXPORT_OPTIONS = {
  format: 'JSON' as const,
  includeRawReport: true,
  includeAssessment: true,
  includeMetadata: true,
  includeTimestamps: true
};

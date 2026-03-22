/**
 * Report Type Definitions
 */

export type ReportStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ReportMetadata {
  location?: string;
  reporterId?: string;
  priority?: Priority;
}

export interface Report {
  id: string;
  timestamp: number;
  rawInput: string;
  metadata: ReportMetadata;
  assessment?: ThreatAssessment;
  status: ReportStatus;
  error?: string;
}

export interface ThreatAssessment {
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  executiveSummary: string;
  correlatedIndicators: string[];
  keyFindings: string[];
  threats?: ThreatEntity[];
  recommendations: Recommendation[];
  intelligence: Intelligence;
  intelligenceTags?: string[];
  timestamp: string;
  rawResponse?: string;
  // Legacy support
  summary?: string;
}

export interface ThreatEntity {
  type: 'PERSONNEL' | 'EQUIPMENT' | 'LOCATION' | 'ACTIVITY' | 'OTHER';
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface Recommendation {
  option: string;
  action: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  // Legacy support
  priority?: number;
  rationale?: string;
  timeframe?: string;
}

export interface Intelligence {
  entities: string[];
  locations: string[];
  timeframe: string;
  keywords: string[];
}

export interface MultiReport {
  source: string;
  timestamp: string;
  content: string;
  threatLevel?: string;
}

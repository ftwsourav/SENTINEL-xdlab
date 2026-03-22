/**
 * Database Service
 * IndexedDB wrapper for offline data persistence
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Report } from '../types/report.types';
import { DB_NAME, DB_VERSION, REPORTS_STORE, CONFIG_STORE } from '../utils/constants';

interface SentinelDB extends DBSchema {
  reports: {
    key: string;
    value: Report;
    indexes: { 'by-timestamp': number; 'by-status': string; 'by-threat-level': string };
  };
  config: {
    key: string;
    value: any;
  };
}

class DbService {
  private db: IDBPDatabase<SentinelDB> | null = null;

  /**
   * Initialize database connection
   */
  async init(): Promise<void> {
    if (this.db) return;

    try {
      this.db = await openDB<SentinelDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Create reports store
          if (!db.objectStoreNames.contains(REPORTS_STORE)) {
            const reportStore = db.createObjectStore(REPORTS_STORE, { keyPath: 'id' });
            reportStore.createIndex('by-timestamp', 'timestamp');
            reportStore.createIndex('by-status', 'status');
            reportStore.createIndex('by-threat-level', 'assessment.threatLevel');
          }

          // Create config store
          if (!db.objectStoreNames.contains(CONFIG_STORE)) {
            db.createObjectStore(CONFIG_STORE, { keyPath: 'key' });
          }
        },
      });

      console.log('IndexedDB initialized');
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      throw error;
    }
  }

  /**
   * Ensure database is initialized
   */
  private async ensureDb(): Promise<IDBPDatabase<SentinelDB>> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  /**
   * Save report to database
   */
  async saveReport(report: Report): Promise<void> {
    const db = await this.ensureDb();
    await db.put(REPORTS_STORE, report);
  }

  /**
   * Get report by ID
   */
  async getReport(id: string): Promise<Report | undefined> {
    const db = await this.ensureDb();
    return await db.get(REPORTS_STORE, id);
  }

  /**
   * Get all reports (sorted by timestamp, newest first)
   */
  async getAllReports(): Promise<Report[]> {
    const db = await this.ensureDb();
    const reports = await db.getAll(REPORTS_STORE);
    return reports.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get reports by date range
   */
  async getReportsByDateRange(startTime: number, endTime: number): Promise<Report[]> {
    const db = await this.ensureDb();
    const tx = db.transaction(REPORTS_STORE, 'readonly');
    const index = tx.store.index('by-timestamp');
    const reports = await index.getAll(IDBKeyRange.bound(startTime, endTime));
    return reports.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Delete report by ID
   */
  async deleteReport(id: string): Promise<void> {
    const db = await this.ensureDb();
    await db.delete(REPORTS_STORE, id);
  }

  /**
   * Clear all reports
   */
  async clearAllReports(): Promise<void> {
    const db = await this.ensureDb();
    await db.clear(REPORTS_STORE);
  }

  /**
   * Get report count
   */
  async getReportCount(): Promise<number> {
    const db = await this.ensureDb();
    return await db.count(REPORTS_STORE);
  }

  /**
   * Save settings
   */
  async saveSettings(key: string, value: any): Promise<void> {
    const db = await this.ensureDb();
    await db.put(CONFIG_STORE, { key, value });
  }

  /**
   * Get settings
   */
  async getSettings(key: string): Promise<any> {
    const db = await this.ensureDb();
    const result = await db.get(CONFIG_STORE, key);
    return result?.value;
  }

  /**
   * Delete settings
   */
  async deleteSettings(key: string): Promise<void> {
    const db = await this.ensureDb();
    await db.delete(CONFIG_STORE, key);
  }

  /**
   * Get database size estimate
   */
  async getStorageEstimate(): Promise<{ usage: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0
      };
    }
    return { usage: 0, quota: 0 };
  }

  /**
   * Export all data as JSON
   */
  async exportAllData(): Promise<{ reports: Report[]; config: any[] }> {
    const db = await this.ensureDb();
    const reports = await db.getAll(REPORTS_STORE);
    const config = await db.getAll(CONFIG_STORE);
    return { reports, config };
  }

  /**
   * Import data from JSON
   */
  async importData(data: { reports: Report[]; config: any[] }): Promise<void> {
    const db = await this.ensureDb();
    
    // Import reports
    const reportTx = db.transaction(REPORTS_STORE, 'readwrite');
    for (const report of data.reports) {
      await reportTx.store.put(report);
    }
    await reportTx.done;

    // Import config
    const configTx = db.transaction(CONFIG_STORE, 'readwrite');
    for (const item of data.config) {
      await configTx.store.put(item);
    }
    await configTx.done;
  }
}

export default new DbService();

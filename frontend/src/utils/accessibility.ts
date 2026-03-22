/**
 * Accessibility Utilities
 * ARIA labels and keyboard navigation helpers
 */

export const ARIA_LABELS = {
  // Navigation
  mainNav: 'Main navigation',
  sidebar: 'Sidebar navigation',
  header: 'Application header',
  
  // Actions
  analyzeReport: 'Analyze threat report',
  clearReport: 'Clear report form',
  exportPDF: 'Export report as PDF',
  exportJSON: 'Export report as JSON',
  exportCSV: 'Export reports as CSV',
  deleteReport: 'Delete this report',
  clearAllReports: 'Clear all reports',
  
  // Forms
  reportInput: 'Field report input',
  sourceTag: 'Source tag or reporter ID',
  location: 'Report location',
  unitDesignation: 'Unit designation',
  classification: 'Classification level',
  threatLevel: 'Initial threat assessment',
  modelSelect: 'AI model selection',
  
  // Status
  connectionStatus: 'AI provider connection status',
  threatLevelBadge: 'Threat level indicator',
  confidenceScore: 'Assessment confidence score',
  
  // Navigation items
  analyzeView: 'Navigate to analyze view',
  historyView: 'Navigate to history view',
  trendsView: 'Navigate to trends view',
  settingsView: 'Navigate to settings view',
  
  // Modals
  closeModal: 'Close dialog',
  confirmAction: 'Confirm action',
  cancelAction: 'Cancel action',
  
  // Theme
  themeToggle: 'Toggle dark/light theme',
  
  // Voice
  voiceInput: 'Start voice input',
  stopVoice: 'Stop voice input',
  
  // Templates
  loadTemplate: 'Load report template',
  
  // Comparison
  selectReport: 'Select report for comparison',
  compareReports: 'Compare selected reports',
};

export const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

export const trapFocus = (element: HTMLElement) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  };
  
  element.addEventListener('keydown', handleTabKey);
  
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
};

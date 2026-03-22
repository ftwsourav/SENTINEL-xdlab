import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ReportInput } from './components/features/ReportInput';
import { AssessmentOutput } from './components/features/AssessmentOutput';
import { History } from './components/features/History';
import { Settings } from './components/features/Settings';
import './styles/variables.css';
import './styles/reset.css';
import './styles/print.css';
import './App.css';

const AppContent: React.FC = () => {
  const { currentView, currentReport } = useApp();

  const renderView = () => {
    if (currentView === 'analyze') {
      if (currentReport && currentReport.status === 'COMPLETED') {
        return <AssessmentOutput />;
      }
      return <ReportInput />;
    }
    
    if (currentView === 'history') {
      return <History />;
    }
    
    if (currentView === 'settings') {
      return <Settings />;
    }
    
    return <ReportInput />;
  };

  return (
    <div className="app">
      <Header />
      <div className="app-body">
        <Sidebar />
        <main className="app-main">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

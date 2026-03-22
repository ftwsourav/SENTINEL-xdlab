import React from 'react';
import { useApp } from '../../context/AppContext';
import './Sidebar.css';

const NAV_ITEMS = [
  { id: 'analyze', label: 'ANALYZE' },
  { id: 'history', label: 'HISTORY' },
  { id: 'settings', label: 'SETTINGS' }
];

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView } = useApp();

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`sidebar-item ${currentView === item.id ? 'sidebar-item-active' : ''}`}
            onClick={() => setCurrentView(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-badge">AIR-GAPPED</div>
        <div className="sidebar-badge">NO TELEMETRY</div>
      </div>
    </aside>
  );
};

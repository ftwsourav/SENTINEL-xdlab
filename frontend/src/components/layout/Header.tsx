/**
 * Header Component
 * Top navigation bar with status indicators
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import './Header.css';

const PROVIDER_NAMES: Record<string, string> = {
  ollama: 'OLLAMA',
  lmstudio: 'LM STUDIO',
  openrouter: 'OPENROUTER',
  sarvam: 'SARVAM AI'
};

export const Header: React.FC = () => {
  const { healthStatus, settings } = useApp();
  const { theme, toggleTheme } = useTheme();
  
  const isConnected = healthStatus?.ollama?.connected || false;
  const providerName = PROVIDER_NAMES[settings.provider] || settings.provider.toUpperCase();
  
  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">SENTINEL</h1>
        <span className="header-subtitle">// TAIS v1.0</span>
      </div>
      <div className="header-right">
        <button 
          className="header-theme-toggle" 
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '☀' : '🌙'}
        </button>
        <div className="header-status">
          <span className={`status-dot ${isConnected ? 'status-connected' : 'status-disconnected'}`}></span>
          <span className="status-text">
            {providerName} {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>
        <div className="header-model">{settings.defaultModel}</div>
        <div className="header-time">{currentTime}</div>
      </div>
    </header>
  );
};

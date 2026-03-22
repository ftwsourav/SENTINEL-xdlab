import React from 'react';
import './LoadingOverlay.css';

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  message = 'SENTINEL IS PROCESSING FIELD INTELLIGENCE...' 
}) => {
  return (
    <div className="loading-overlay">
      <div className="scanning-lines">
        <div className="scan-line"></div>
        <div className="scan-line"></div>
        <div className="scan-line"></div>
      </div>
      <div className="loading-content">
        <div className="loading-spinner-large"></div>
        <div className="loading-message">{message}</div>
      </div>
    </div>
  );
};

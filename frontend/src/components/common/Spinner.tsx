/**
 * Loading Spinner Component
 */

import React from 'react';
import './Spinner.css';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'medium', 
  text,
  className = '' 
}) => {
  return (
    <div className={`spinner-container ${className}`}>
      <div className={`spinner spinner-${size}`}></div>
      {text && <div className="spinner-text">{text}</div>}
    </div>
  );
};

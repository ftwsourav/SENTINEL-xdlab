/**
 * Badge Component
 * Status and threat level indicators
 */

import React from 'react';
import './Badge.css';

interface BadgeProps {
  children: React.ReactNode;
  variant: 'critical' | 'high' | 'medium' | 'low' | 'pending' | 'processing' | 'completed' | 'error';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant, className = '' }) => {
  const classNames = ['badge', `badge-${variant}`, className].filter(Boolean).join(' ');

  return <span className={classNames}>{children}</span>;
};

/**
 * Error Boundary Component
 * Catches React errors and provides fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-boundary-icon">⚠</div>
            <h1 className="error-boundary-title">SYSTEM ERROR</h1>
            <p className="error-boundary-message">
              SENTINEL encountered an unexpected error and needs to restart.
            </p>
            {this.state.error && (
              <div className="error-boundary-details">
                <p className="error-boundary-error-name">{this.state.error.name}</p>
                <p className="error-boundary-error-message">{this.state.error.message}</p>
              </div>
            )}
            <button className="error-boundary-button" onClick={this.handleReset}>
              RESTART APPLICATION
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

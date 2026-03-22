/**
 * Toast Notification Component
 * Displays temporary notification messages
 */

import React from 'react';
import { ToastContainer, toast as toastify, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Toast.css';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        className="sentinel-toast-container"
      />
    </>
  );
};

// Toast utility functions
export const toast = {
  success: (message: string, options?: ToastOptions) => {
    toastify.success(message, {
      ...options,
      className: 'sentinel-toast sentinel-toast-success',
    });
  },

  error: (message: string, options?: ToastOptions) => {
    toastify.error(message, {
      ...options,
      className: 'sentinel-toast sentinel-toast-error',
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    toastify.warning(message, {
      ...options,
      className: 'sentinel-toast sentinel-toast-warning',
    });
  },

  info: (message: string, options?: ToastOptions) => {
    toastify.info(message, {
      ...options,
      className: 'sentinel-toast sentinel-toast-info',
    });
  },

  loading: (message: string) => {
    return toastify.loading(message, {
      className: 'sentinel-toast sentinel-toast-loading',
    });
  },

  update: (toastId: any, options: ToastOptions) => {
    toastify.update(toastId, options);
  },

  dismiss: (toastId?: any) => {
    toastify.dismiss(toastId);
  },
};

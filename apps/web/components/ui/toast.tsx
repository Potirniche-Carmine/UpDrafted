"use client";

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from './button';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: () => void;
}

interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// Toast Component
function Toast({ type, title, message, duration = 5000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-green-200 dark:border-green-700';
      case 'error':
        return 'border-red-200 dark:border-red-700';
      case 'warning':
        return 'border-yellow-200 dark:border-yellow-700';
      case 'info':
        return 'border-blue-200 dark:border-blue-700';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-950';
      case 'error':
        return 'bg-red-50 dark:bg-red-950';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-950';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-950';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800 dark:text-green-200';
      case 'error':
        return 'text-red-800 dark:text-red-200';
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-200';
      case 'info':
        return 'text-blue-800 dark:text-blue-200';
    }
  };

  return (
    <div
      className={`
        ${getBackgroundColor()} ${getBorderColor()} ${getTextColor()}
        border rounded-lg p-4 shadow-lg dark:shadow-black/40 max-w-sm w-full
        animate-in slide-in-from-right-full duration-300
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            {title}
          </p>
          {message && (
            <p className="text-sm mt-1 opacity-90">
              {message}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="flex-shrink-0 h-6 w-6 p-0 hover:bg-transparent opacity-70 hover:opacity-100"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// Toast Container Component
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Listen for toast events
  useEffect(() => {
    const handleToast = (event: CustomEvent<ToastData>) => {
      const toast = { ...event.detail, id: Date.now().toString() };
      setToasts(prev => [...prev, toast]);
    };

    window.addEventListener('show-toast', handleToast as EventListener);

    return () => {
      window.removeEventListener('show-toast', handleToast as EventListener);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

// Toast Hook
export function useToast() {
  const showToast = (toast: Omit<ToastData, 'id'>) => {
    const event = new CustomEvent('show-toast', { detail: toast });
    window.dispatchEvent(event);
  };

  return {
    toast: showToast,
    success: (title: string, message?: string, duration?: number) =>
      showToast({ type: 'success', title, message, duration }),
    error: (title: string, message?: string, duration?: number) =>
      showToast({ type: 'error', title, message, duration }),
    warning: (title: string, message?: string, duration?: number) =>
      showToast({ type: 'warning', title, message, duration }),
    info: (title: string, message?: string, duration?: number) =>
      showToast({ type: 'info', title, message, duration }),
  };
}

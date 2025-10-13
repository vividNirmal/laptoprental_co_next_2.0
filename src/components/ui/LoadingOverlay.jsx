"use client";
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const LoadingOverlay = ({
  isLoading,
  message = 'Loading...',
  children,
  className = '',
  spinnerSize = 'lg',
  spinnerColor = 'blue'
}) => {
  if (!isLoading) return children;

  return (
    <div className={`relative ${className}`}>
      {children}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
        <LoadingSpinner
          size={spinnerSize}
          color={spinnerColor}
          message={message}
          showMessage={true}
        />
      </div>
    </div>
  );
};

export default LoadingOverlay;

"use client";
import React from 'react';

const LoadingSpinner = ({
  size = 'md',
  color = 'blue',
  message = 'Loading...',
  showMessage = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    gray: 'text-gray-600',
    white: 'text-white'
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <div className="relative">
        <div
          className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin rounded-full border-2 border-current border-t-transparent`}
          style={{ animationDuration: '0.75s' }}
        />
        <div
          className={`${sizeClasses[size]} ${colorClasses[color]} animate-ping rounded-full border-2 border-current opacity-20 absolute top-0 left-0`}
          style={{ animationDuration: '1.5s' }}
        />
      </div>
      {showMessage && (
        <p className={`text-sm font-medium ${colorClasses[color]} animate-pulse`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
